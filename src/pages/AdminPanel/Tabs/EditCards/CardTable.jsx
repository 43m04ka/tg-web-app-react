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
    emptyText = 'Товары не найдены',
}) => {
    const allSelected = cardList.length > 0 && selectedIds.length === cardList.length;

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
                    <th className={style['numCol']}>ID</th>
                    <th className={style['numCol']}>Цена</th>
                    <th className={style['statusCol']}>Статус</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={5} className={style['emptyCell']}>Загрузка…</td>
                    </tr>
                ) : cardList.length === 0 ? (
                    <tr>
                        <td colSpan={5} className={style['emptyCell']}>{emptyText}</td>
                    </tr>
                ) : (
                    cardList.map((item) => {
                        const selected = selectedIds.includes(item.id);
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
                                    {item.platform ? <span className={style['platform']}>{item.platform}</span> : null}
                                </td>
                                <td className={`${style['numCol']} ${style['mono']}`}>{item.id}</td>
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
