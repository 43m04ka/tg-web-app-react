import React, {useCallback, useMemo, useState} from 'react';
import TabPane from '../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../Elements/FormLayout/FormLayout';
import useData from '../../useData';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import FlagPicker from '../../Elements/FlagPicker/FlagPicker';
import {isFlagName} from '../../Elements/FlagPicker/flags';
import {useServer} from './useServer';
import {FULFILLMENT_OPTIONS, KIND_OPTIONS, money, parsePrice} from './serviceModel';
import s from './Services.module.scss';

const NO_GROUP = '__none__';
const NEW_REGION = '__new__';

let counter = 0;
const uid = () => {
    counter += 1;
    return `k${counter}`;
};

const cellKey = (columnUid, rowUid) => `${columnUid}|${rowUid}`;

const uniqueNames = (list) => {
    const seen = new Set();
    const result = [];

    list.forEach((name) => {
        const key = name || NO_GROUP;
        if (seen.has(key)) return;
        seen.add(key);
        result.push(name || '');
    });

    return result;
};

const buildState = (offers) => {
    const columns = uniqueNames(offers.map((offer) => offer.groupName || ''))
        .map((name) => ({uid: uid(), name}));
    const rows = uniqueNames(offers.map((offer) => offer.denomination))
        .map((name) => ({uid: uid(), name}));

    const cells = {};
    offers.forEach((offer) => {
        const column = columns.find((item) => item.name === (offer.groupName || ''));
        const row = rows.find((item) => item.name === offer.denomination);
        if (!column || !row) return;

        cells[cellKey(column.uid, row.uid)] = {
            id: offer.id,
            price: String(offer.price ?? ''),
            oldPrice: offer.oldPrice === null || offer.oldPrice === undefined ? '' : String(offer.oldPrice),
        };
    });

    return {columns: columns.length ? columns : [{uid: uid(), name: ''}], rows, cells};
};

const PlanMatrix = ({brandId, findBrand, onClose, onSaved}) => {
    const {authenticationData} = useData();
    const {bulkSaveOffers} = useServer();
    const {showToast, confirm} = useFeedback();

    const brand = findBrand(brandId);

    const ownOffers = useMemo(
        () => (brand?.offers || []).filter((offer) => !offer.fromCatalog),
        [brand],
    );

    const [kind, setKind] = useState(() => (
        ownOffers.some((offer) => offer.kind === 'subscription') ? 'subscription' : 'gift_card'
    ));

    const regions = useMemo(
        () => uniqueNames(ownOffers.filter((offer) => offer.kind === kind).map((offer) => offer.regionName)),
        [ownOffers, kind],
    );

    const [regionKey, setRegionKey] = useState(() => regions[0] || NEW_REGION);
    const [newRegion, setNewRegion] = useState('Россия');

    const regionName = regionKey === NEW_REGION ? newRegion : regionKey;

    const scope = useMemo(
        () => (regionKey === NEW_REGION
            ? []
            : ownOffers.filter((offer) => offer.kind === kind && offer.regionName === regionKey)),
        [ownOffers, kind, regionKey],
    );

    const [state, setState] = useState(() => buildState(scope));
    const [scopeKey, setScopeKey] = useState(`${kind}|${regionKey}`);
    const [fulfillment, setFulfillment] = useState(() => (
        scope.some((offer) => offer.fulfillment === 'code') ? 'code' : 'manual'
    ));
    const [regionIcon, setRegionIcon] = useState(() => scope[0]?.regionIcon || '');
    const [regionFlag, setRegionFlag] = useState(() => scope[0]?.regionFlag || '');
    const [showOldPrice, setShowOldPrice] = useState(() => scope.some((offer) => offer.oldPrice));
    const [saving, setSaving] = useState(false);

    const currentKey = `${kind}|${regionKey}`;
    if (currentKey !== scopeKey) {
        setScopeKey(currentKey);
        setState(buildState(scope));
        setFulfillment(scope.some((offer) => offer.fulfillment === 'code') ? 'code' : 'manual');
        setRegionIcon(scope[0]?.regionIcon || '');
        setRegionFlag(scope[0]?.regionFlag || '');
        setShowOldPrice(scope.some((offer) => offer.oldPrice));
    }

    const setCell = useCallback((key, patch) => setState((prev) => ({
        ...prev,
        cells: {...prev.cells, [key]: {...(prev.cells[key] || {id: null, price: '', oldPrice: ''}), ...patch}},
    })), []);

    const renameColumn = (columnUid, name) => setState((prev) => ({
        ...prev,
        columns: prev.columns.map((item) => (item.uid === columnUid ? {...item, name} : item)),
    }));

    const renameRow = (rowUid, name) => setState((prev) => ({
        ...prev,
        rows: prev.rows.map((item) => (item.uid === rowUid ? {...item, name} : item)),
    }));

    const addColumn = () => setState((prev) => ({...prev, columns: [...prev.columns, {uid: uid(), name: ''}]}));

    const addRow = () => setState((prev) => ({...prev, rows: [...prev.rows, {uid: uid(), name: ''}]}));

    const dropColumn = (columnUid) => setState((prev) => ({
        ...prev,
        columns: prev.columns.filter((item) => item.uid !== columnUid),
        cells: Object.fromEntries(
            Object.entries(prev.cells).filter(([key]) => key.split('|')[0] !== columnUid),
        ),
    }));

    const dropRow = (rowUid) => setState((prev) => ({
        ...prev,
        rows: prev.rows.filter((item) => item.uid !== rowUid),
        cells: Object.fromEntries(
            Object.entries(prev.cells).filter(([key]) => key.split('|')[1] !== rowUid),
        ),
    }));

    const filled = useMemo(() => {
        const result = [];

        state.columns.forEach((column, columnIndex) => {
            state.rows.forEach((row, rowIndex) => {
                const cell = state.cells[cellKey(column.uid, row.uid)];
                const price = parsePrice(cell?.price ?? '');
                if (price === null || price <= 0) return;

                result.push({
                    cell,
                    column,
                    row,
                    price,
                    oldPrice: showOldPrice ? parsePrice(String(cell?.oldPrice ?? '').trim() || '0') : null,
                    serialNumber: columnIndex * 100 + rowIndex,
                });
            });
        });

        return result;
    }, [state, showOldPrice]);

    const total = useMemo(() => filled.reduce((sum, item) => sum + item.price, 0), [filled]);

    const keptIds = useMemo(
        () => new Set(filled.map((item) => item.cell?.id).filter(Boolean)),
        [filled],
    );

    const deleteIds = useMemo(
        () => scope.map((offer) => offer.id).filter((id) => !keptIds.has(id)),
        [scope, keptIds],
    );

    const handleFlag = (flag) => {
        setRegionIcon(flag.icon);
        if (regionKey !== NEW_REGION) return;
        if (!newRegion.trim() || isFlagName(newRegion)) setNewRegion(flag.name);
    };

    const handleSave = async () => {
        if (!regionName.trim()) {
            showToast('Регион обязателен — он же попадает в строку активации', 'error');
            return;
        }

        const emptyRow = filled.find((item) => !item.row.name.trim());
        if (emptyRow) {
            showToast('У каждой заполненной строки должен быть номинал', 'error');
            return;
        }

        if (!filled.length && !deleteIds.length) {
            showToast('Сетка пуста — заполнять нечего', 'error');
            return;
        }

        if (deleteIds.length) {
            const agreed = await confirm({
                title: 'Удалить лишние позиции?',
                text: `Из сетки пропало ${deleteIds.length} позиций — они исчезнут с витрины вместе`
                    + ' со своим складом кодов. Действие необратимо.',
                confirmLabel: 'Сохранить и удалить',
                danger: true,
            });
            if (!agreed) return;
        }

        const offers = filled.map((item) => ({
            id: item.cell?.id || null,
            kind,
            groupName: item.column.name.trim() || null,
            regionName: regionName.trim(),
            regionIcon: regionIcon || null,
            regionFlag: regionFlag.trim() || null,
            denomination: item.row.name.trim(),
            price: item.price,
            oldPrice: item.oldPrice || null,
            fulfillment,
            serialNumber: item.serialNumber,
            isHidden: false,
        }));

        setSaving(true);
        try {
            const result = await bulkSaveOffers(authenticationData, brandId, offers, deleteIds);
            const stats = result?.result || {};

            showToast(
                `Сетка сохранена: ${stats.created || 0} новых, ${stats.updated || 0} обновлено`
                + `${stats.deleted ? `, ${stats.deleted} удалено` : ''}`,
                'success',
            );

            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить сетку', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!brand) {
        return (
            <TabPane>
                <p className={s['formNote']}>Бренд не найден — возможно, его удалили.</p>
            </TabPane>
        );
    }

    return (
        <TabPane
            footer={(
                <>
                    <span className={s['formStatus']}>
                        {filled.length} позиций
                        {deleteIds.length ? ` · ${deleteIds.length} к удалению` : ''}
                        {filled.length ? ` · сумма ${money(total)}` : ''}
                    </span>
                    <button type="button" className={s['btn']} onClick={onClose}>Отмена</button>
                    <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                            disabled={saving} onClick={handleSave}>
                        {saving ? 'Сохранение…' : 'Сохранить сетку'}
                    </button>
                </>
            )}
        >
            <Sheet>
                <Group title="Что заполняем">
                    <p className={s['formNote']}>
                        Столбцы — тарифы («Индивидуальная», «DUO»), строки — периоды («1 месяц»).
                        В клетке цена: заполнили — позиция есть, стёрли — позиции не будет.
                        Сохранение переписывает только выбранный тип и регион, остальное не трогает.
                    </p>
                    <Row label="Тип" hint="Селектор «Тип товара» на витрине">
                        <select className={`${f.input} ${f.select}`} value={kind}
                                onChange={(event) => setKind(event.target.value)}>
                            {KIND_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>{option.name}</option>
                            ))}
                        </select>
                    </Row>
                    <Row label="Регион" hint="Одна сетка — один регион. Смена региона перезагружает сетку">
                        <select className={`${f.input} ${f.select}`} value={regionKey}
                                onChange={(event) => setRegionKey(event.target.value)}>
                            {regions.map((name) => <option key={name} value={name}>{name}</option>)}
                            <option value={NEW_REGION}>Новый регион…</option>
                        </select>
                    </Row>
                    {regionKey === NEW_REGION ? (
                        <Row label="Название региона" hint="Попадает и в переключатель региона, и в строку активации">
                            <input className={f.input} type="text" placeholder="Россия"
                                   value={newRegion}
                                   onChange={(event) => setNewRegion(event.target.value)}/>
                        </Row>
                    ) : null}
                    <Row label="Флаг" hint="Ставится всем позициям сетки сразу">
                        <FlagPicker value={regionIcon}
                                    onPick={handleFlag}
                                    onClear={() => setRegionIcon('')}/>
                    </Row>
                    <Row label="Эмодзи" hint="Запасной вариант, пока флаг не выбран">
                        <input className={`${f.input} ${f.mono}`} type="text" maxLength={4} placeholder="🇷🇺"
                               value={regionFlag}
                               onChange={(event) => setRegionFlag(event.target.value)}/>
                    </Row>
                    <Row label="Выдача" hint="Подписки обычно оформляет менеджер — склад кодов им не нужен">
                        <select className={`${f.input} ${f.select}`} value={fulfillment}
                                onChange={(event) => setFulfillment(event.target.value)}>
                            {FULFILLMENT_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>{option.name}</option>
                            ))}
                        </select>
                    </Row>
                    <Row label="Старые цены" hint="Второе поле в клетке — зачёркнутая цена для скидки">
                        <input type="checkbox"
                               checked={showOldPrice}
                               onChange={(event) => setShowOldPrice(event.target.checked)}/>
                    </Row>
                </Group>

                <Group title="Сетка">
                    <div className={s['matrixScroll']}>
                        <table className={s['matrix']}>
                            <thead>
                                <tr>
                                    <th className={s['matrixCorner']}>Период \ Тариф</th>
                                    {state.columns.map((column) => (
                                        <th key={column.uid} className={s['matrixHeadCell']}>
                                            <input className={s['matrixInput']} type="text" placeholder="Без тарифа"
                                                   value={column.name}
                                                   onChange={(event) => renameColumn(column.uid, event.target.value)}/>
                                            {state.columns.length > 1 ? (
                                                <button type="button" className={s['matrixDrop']}
                                                        title="Удалить тариф"
                                                        onClick={() => dropColumn(column.uid)}>×</button>
                                            ) : null}
                                        </th>
                                    ))}
                                    <th className={s['matrixAddCol']}>
                                        <button type="button" className={s['btn']} onClick={addColumn}>+ тариф</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.rows.map((row) => (
                                    <tr key={row.uid}>
                                        <th className={s['matrixRowHead']}>
                                            <input className={s['matrixInput']} type="text" placeholder="1 месяц"
                                                   value={row.name}
                                                   onChange={(event) => renameRow(row.uid, event.target.value)}/>
                                            <button type="button" className={s['matrixDrop']}
                                                    title="Удалить период"
                                                    onClick={() => dropRow(row.uid)}>×</button>
                                        </th>

                                        {state.columns.map((column) => {
                                            const key = cellKey(column.uid, row.uid);
                                            const cell = state.cells[key];

                                            return (
                                                <td key={column.uid} className={s['matrixCell']}>
                                                    <input className={s['matrixPrice']} type="number" min={0} step={1}
                                                           placeholder="—"
                                                           value={cell?.price ?? ''}
                                                           onChange={(event) => setCell(key, {price: event.target.value})}/>
                                                    {showOldPrice ? (
                                                        <input className={`${s['matrixPrice']} ${s['matrixOldPrice']}`}
                                                               type="number" min={0} step={1} placeholder="было"
                                                               value={cell?.oldPrice ?? ''}
                                                               onChange={(event) => setCell(key, {oldPrice: event.target.value})}/>
                                                    ) : null}
                                                    {cell?.id ? <span className={s['matrixId']}>#{cell.id}</span> : null}
                                                </td>
                                            );
                                        })}

                                        <td className={s['matrixAddCol']}/>
                                    </tr>
                                ))}

                                <tr>
                                    <th className={s['matrixRowHead']}>
                                        <button type="button" className={s['btn']} onClick={addRow}>+ период</button>
                                    </th>
                                    <td className={s['matrixAddCol']} colSpan={state.columns.length + 1}/>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Group>
            </Sheet>
        </TabPane>
    );
};

export default PlanMatrix;
