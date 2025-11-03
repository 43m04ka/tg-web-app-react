import React, {useEffect, useState} from 'react';
import style from './Basket.module.scss';
import {useServer} from "./useServer";
import {useTelegram} from "../../../../hooks/useTelegram";
import useGlobalData from "../../../../hooks/useGlobalData";
import ProductItemBasket from "./Elements/ProductItemBasket";
import AccountData from "./Elements/AccountData";
import PromoInput from "./Elements/PromoInput";

const Basket = () => {

    const {getBasketList, createOrder} = useServer()
    const {user, tg} = useTelegram()
    const {pageId, catalogList} = useGlobalData()
    const [accountData, setAccountData] = useState('')

    const [positionList, setPositionList] = React.useState(null)

    const reload = async () => {
        await getBasketList((result) => {
            let catalogIdList = catalogList.map(cat => {
                return cat.structurePageId === pageId ? cat.id : null
            }).filter(cat => cat !== null)

            setPositionList(result.map(item => {
                return catalogIdList.includes(item.catalogId) ? item : null
            }).filter(item => item !== null))
        }, user.id)
    }

    useEffect(() => {
        reload().then()
    }, []);

    console.log(positionList)

    if (positionList !== null) {
        if (positionList.length === 0) {

        } else if (positionList.length > 0) {

            return (<div className={style['mainContainer']}
                         style={{paddingBottom: String(window.innerWidth * 0.20 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px'}}>
                <div className={style['title']}>Ваша корзина</div>
                {positionList.map(item => (<ProductItemBasket product={item} onReload={reload}/>))}
                {pageId !== 29 ? <AccountData returnAccountData={setAccountData}/> : ''}
                {/*<PromoInput/>*/}
                <div className={style['total']}>
                    <div>
                        <div>Итого к оплате:</div>
                        <div>{positionList.map(el=>{return el.similarCard !== null ? el.similarCard.price : el.price}).reduce((accumulator, currentValue) => accumulator + currentValue, 0)}₽</div>
                    </div>
                    <div onClick={()=>{
                        createOrder(accountData, user, pageId).then()
                    }}>Оформить заказ</div>
                    <div>
                        Нажимая на кнопку, Вы соглашаетесь с
                        <a href={'https://t.me/gwstore_faq/12'}>
                            Условиями обработки персональных данных
                        </a>
                        , а также с
                        <a href={'https://t.me/gwstore_faq/11'}>
                            Пользовательским соглашением
                        </a>
                    </div>
                </div>
            </div>);
        }
    }
};

export default Basket;
