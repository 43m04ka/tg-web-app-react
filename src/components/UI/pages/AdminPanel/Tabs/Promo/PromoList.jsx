import React from 'react';
import style from "../../AdminPanel.module.scss";

const PromoList = ({promoList, setPromoId}) => {

    const [selectedId, setSelectedId] = React.useState(-1);

    return (
        <div className={style['listScrollY']}>
            {promoList.length > 0 ?
                <div>
                    <div className={style['listScrollYCap']}>
                        <div>Имя</div>
                        <div>Общее кол-во использований</div>
                        <div>Процент</div>
                        <div>123</div>
                    </div>
                    {promoList.map(({id, name, totalNumberUses, percent}, index) => (
                        <div onClick={() => {setSelectedId(id);setPromoId(id);}} className={style['listScrollYElement-'+index%2]}>
                            <div>{name}</div>
                            <div>{totalNumberUses}</div>
                            <div>{percent + '%'}</div>
                            <div>Удалить</div>
                        </div>
                    ))}
                </div>
                :
                <div className={style['']}>Нет активных промокодов</div>}
        </div>
    );
};

export default PromoList;