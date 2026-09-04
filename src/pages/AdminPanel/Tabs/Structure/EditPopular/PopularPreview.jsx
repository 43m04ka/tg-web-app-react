import React from 'react';
import PopularRail from '../../../../SelectPlatform/PopularRail';
import style from './PopularPreview.module.scss';

// Витрина скрывает снятые с продажи позиции — превью обязано вести себя так же,
// иначе админ видит в панели карусель, которой у покупателя нет.
const visibleOnly = (items) => items.filter(({product}) => (
    product && product.onSale !== false && product.isHidden !== true
));

const PopularPreview = ({items}) => {
    const visible = visibleOnly(items);

    return (
        <div className={style['frame']}>
            <div className={style['phone']}>
                <div className={style['phoneShell']}>
                    <div className={style['phoneInner']}>
                        <div className={style['heading']}>
                            Геймворд — ваш сервис для покупки игр и подписок
                        </div>

                        {visible.length === 0 ? (
                            <p className={style['empty']}>
                                Карусель не показывается: в списке нет ни одной позиции в продаже
                            </p>
                        ) : (
                            <PopularRail items={visible} onOpen={() => {}}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopularPreview;
