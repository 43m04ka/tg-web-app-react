import React from 'react';
import s from './FormLayout.module.scss';

/**
 * Компактная построчная форма для содержимого вкладок.
 * Вместо «коробок» с полями в две колонки — плотный список строк
 * «подпись слева, контрол справа»: форма занимает вдвое меньше высоты и читается сверху вниз.
 */

/** Лист ограниченной ширины: поля не растягиваются на весь монитор. */
export const Sheet = ({children}) => <div className={s.sheet}>{children}</div>;

/** Группа строк с маленьким заголовком. Заголовок необязателен. */
export const Group = ({title, children}) => (
    <section className={s.group}>
        {title ? <h3 className={s.groupTitle}>{title}</h3> : null}
        <div className={s.rows}>{children}</div>
    </section>
);

/**
 * Строка формы. `top` — подпись прижата к верху (для textarea, списков, превью),
 * `wide` — контрол занимает всю ширину строки (по умолчанию ограничен).
 */
export const Row = ({label, hint, top, wide, children}) => (
    <div className={`${s.row} ${top ? s.rowTop : ''} ${wide ? '' : s.rowNarrow}`}>
        <div className={s.rowLabel}>
            <span>{label}</span>
            {hint ? <span className={s.rowHint}>{hint}</span> : null}
        </div>
        <div className={s.rowControl}>{children}</div>
    </div>
);

/** Разделы длинной формы слева: вместо бесконечной ленты — переключение. */
export const Rail = ({items, active, onSelect}) => (
    <nav className={s.rail}>
        {items.map((item) => (
            <button
                key={item}
                type="button"
                className={`${s.railItem} ${active === item ? s.railItemActive : ''}`}
                onClick={() => onSelect(item)}
            >
                {item}
            </button>
        ))}
    </nav>
);

export const Split = ({children}) => <div className={s.split}>{children}</div>;

export default s;
