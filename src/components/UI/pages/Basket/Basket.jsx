import React, {useEffect, useState} from 'react';
import style from './Basket.module.scss';
import {useServer} from "./useServer";
import {useTelegram} from "../../../../hooks/useTelegram";
import useGlobalData from "../../../../hooks/useGlobalData";
import ProductItemBasket from "./Elements/ProductItemBasket";
import AccountData from "./Elements/AccountData";
import Promo from "./Elements/Promo";
import {useNavigate} from "react-router-dom";

const Basket = () => {

    const {getBasketList, createOrder} = useServer()
    const {user, tg} = useTelegram()
    const {pageId, catalogList} = useGlobalData()
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState('')
    const [promoData, setPromoData] = useState({percent: 0, name: ''})

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
            return (<div className={style['emptyBasket']}>
                <div/>
                <div>В корзине ничего нет</div>
                <div onClick={()=>{navigate(window.location.pathname.replace('basket',''));}}>перейти к покупкам</div>
            </div>)
        } else if (positionList.length > 0) {

            return (<div className={style['mainContainer']}
                         style={{paddingBottom: String(window.innerWidth * 0.20 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px'}}>
                <div className={style['title']}>Ваша корзина</div>
                {positionList.map(item => (<ProductItemBasket product={item} onReload={reload}/>))}
                {pageId !== 29 ? <AccountData returnAccountData={setAccountData}/> : ''}
                {<Promo setPromoData={setPromoData}/>}
                <div className={style['total']}>
                    <div>
                        <div>Итого к оплате:</div>
                        <div>{positionList.map(el => {
                            return el.similarCard !== null ? el.similarCard.price : el.price
                        }).reduce((accumulator, currentValue) => accumulator + currentValue, 0) * (1 - promoData.percent / 100)}₽
                        </div>
                        {promoData.percent > 0 ?
                            <div>
                                {positionList.map(el => {
                                    return el.similarCard !== null ? el.similarCard.price : el.price
                                }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)}₽
                            </div> : ''}
                    </div>
                    <div onClick={() => {
                        createOrder(accountData, user, pageId, promoData.name).then()
                    }}>Оформить заказ
                    </div>
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
