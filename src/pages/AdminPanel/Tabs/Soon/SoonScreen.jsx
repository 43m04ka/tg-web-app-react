import React from 'react';
import s from './SoonScreen.module.scss';

/**
 * Заготовка раздела: заголовок и объяснение, что здесь будет.
 *
 * Заведена под витрины, которые не собираются каталогами и блоками (Steam, Сервисы):
 * ссылка на них уже есть в правой половине «Страниц», и вести она должна на живой
 * раздел, а не в пустоту.
 */
const SoonScreen = ({title, subtitle, description}) => (
    <div className={s['screen']}>
        <header className={s['header']}>
            <h1 className={s['title']}>{title}</h1>
            {subtitle ? <span className={s['subtitle']}>{subtitle}</span> : null}
        </header>

        <div className={s['placeholder']}>
            <p className={s['placeholderTitle']}>Раздел пока пустой</p>
            {description ? <p className={s['placeholderText']}>{description}</p> : null}
        </div>
    </div>
);

export default SoonScreen;
