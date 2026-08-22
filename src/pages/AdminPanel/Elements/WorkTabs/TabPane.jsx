import React from 'react';
import s from './TabPane.module.scss';

/**
 * Каркас содержимого открытой вкладки: прокручиваемое тело и полоса действий снизу.
 * Заголовок не рисуем — его роль выполняет сама вкладка в строке сверху.
 * `narrow` — полоса действий выравнивается по ширине формы, а не по краю экрана.
 */
const TabPane = ({footer, narrow, children}) => (
    <div className={s.root}>
        <div className={s.body}>{children}</div>
        {footer ? (
            <footer className={s.footer}>
                <div className={`${s.footerInner} ${narrow ? s.footerNarrow : ''}`}>{footer}</div>
            </footer>
        ) : null}
    </div>
);

export default TabPane;
