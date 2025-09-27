import React from 'react';
import BlockLabel from "../../Elements/BlockLabel";
import style from "./Promo.module.scss";
import InputLabel from "../../Elements/InputLabel";
import ButtonLabel from "../../Elements/ButtonLabel";

const PromoList = ({promoList, setPromoId, onReload}) => {

    const [selectedId, setSelectedId] = React.useState(-1);

    return (
        <div>
            <BlockLabel label={'Список'} onReload={onReload}>
                {promoList.length > 0 ?
                    <div className={style['order-choice-main']}>
                        {promoList.map(item => (
                            <div
                                className={`${style['order-choice-block']}  ${style['order-choice-' + (selectedId === item.id ? 'active' : '')]}`}
                                onClick={() => {
                                    setSelectedId(item.id);
                                    setPromoId(item.id);
                                }}>
                                <div className={style['order-choice-label']}>{item.name}</div>
                                <div className={style['order-choice-label']}>{item.totalNumberUses}</div>
                                <div className={style['order-choice-label']}>{item.percent + '%'}</div>
                                <div
                                    className={style['order-choice-label']}>{selectedId === item.id ? '>Выбрано<' : '>Выбрать<'}</div>
                            </div>
                        ))}
                    </div>
                    :
                    <div className={style['order-choice-empty']}>Нет активных промокодов</div>}
            </BlockLabel>
        </div>
    );
};

export default PromoList;