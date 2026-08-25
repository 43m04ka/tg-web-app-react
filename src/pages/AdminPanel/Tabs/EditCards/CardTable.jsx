import React from 'react';
import style from './EditCards.module.scss';

const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    const number = Number(value);
    return Number.isFinite(number) ? `${number.toLocaleString('ru-RU')} ₽` : String(value);
};

const CardTable = ({
    cardList,
    loading,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onOpenCard,
    catalogById,
    typeLabels = {},
    emptyText = 'Товары не найдены',
}) => {
    const allSelected = cardList.length > 0 && selectedIds.length === cardList.length;
    const columns = 6;

    return (
        <table className={style['table']}>
            <thead>
                <tr>
                    <th className={style['checkCol']}>
                        <input
                            type="checkbox"
                            className={style['checkbox']}
                            checked={allSelected}
                            onChange={onToggleSelectAll}
                            aria-label="Выделить всё"
                        />
                    </th>
                    <th>Название</th>
                    {/* Каталог и тип — то, по чему список фильтруется, поэтому они
                        должны быть видны в строке, а не только в выпадающих списках */}
                    <th className={style['catalogCol']}>Каталог</th>
                    <th className={style['typeCol']}>Тип</th>
                    <th className={style['numCol']}>Цена</th>
                    <th className={style['statusCol']}>Статус</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={columns} className={style['emptyCell']}>Загрузка…</td>
                    </tr>
                ) : cardList.length === 0 ? (
                    <tr>
                        <td colSpan={columns} className={style['emptyCell']}>{emptyText}</td>
                    </tr>
                ) : (
                    cardList.map((item) => {
                        const selected = selectedIds.includes(item.id);
                        const catalog = catalogById?.get(item.catalogId);

                        return (
                            <tr
                                key={item.id}
                                className={selected ? style['rowSelected'] : ''}
                                onClick={() => onToggleSelect(item.id)}
                                onDoubleClick={() => onOpenCard?.(item)}
                            >
                                <td className={style['checkCol']}>
                                    <input
                                        type="checkbox"
                                        className={style['checkbox']}
                                        checked={selected}
                                        onChange={() => onToggleSelect(item.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`Выбрать ${item.name}`}
                                    />
                                </td>
                                <td className={style['nameCell']}>
                                    <span className={style['name']}>{item.name}</span>
                                    <span className={style['rowMeta']}>
                                        <span className={style['mono']}>ID {item.id}</span>
                                        {item.platform ? <span className={style['platform']}>{item.platform}</span> : null}
                                    </span>
                                </td>
                                <td className={style['catalogCol']}>
                                    {/* Каталога может не быть в справочнике: товар остался
                                        от удалённого каталога — показываем хотя бы его id */}
                                    <span className={style['catalogPath']}>
                                        {catalog?.path || (item.catalogId ? `ID ${item.catalogId}` : '—')}
                                    </span>
                                </td>
                                <td className={style['typeCol']}>
                                    <span className={style['typeText']}>
                                        {item.typeLabel || typeLabels[item.type] || item.type || '—'}
                                    </span>
                                </td>
                                <td className={style['numCol']}>
                                    <span className={style['price']}>{formatPrice(item.price)}</span>
                                    {item.oldPrice ? (
                                        <span className={style['oldPrice']}>{formatPrice(item.oldPrice)}</span>
                                    ) : null}
                                </td>
                                <td className={style['statusCol']}>
                                    <span className={item.onSale ? style['badgeOn'] : style['badgeOff']}>
                                        {item.onSale ? 'В продаже' : 'Снят'}
                                    </span>
                                    {/* Скрытый товар продаётся как обычно — он просто не показывается
                                        в списках. Это отдельное состояние, а не «снят с продажи» */}
                                    {item.isHidden ? (
                                        <span className={style['badgeHidden']}>Скрыт</span>
                                    ) : null}
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    );
};

export default CardTable;
