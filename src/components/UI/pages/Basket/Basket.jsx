import React, {useEffect, useState} from 'react';
import style from './Basket.module.scss';
import {useServer} from "./useServer";
import {useTelegram} from "../../../../hooks/useTelegram";
import useGlobalData from "../../../../hooks/useGlobalData";
import ProductItemBasket from "./Elements/ProductItemBasket";
import AccountData from "./Elements/AccountData";
import Promo from "./Elements/Promo";
import {Link, useNavigate} from "react-router-dom";

const Basket = () => {

    const {getBasketList, createOrder} = useServer()
    const {user, tg} = useTelegram()
    const {pageId, catalogList, basket, updateBasket} = useGlobalData()
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState('')
    const [promoData, setPromoData] = useState({percent: 0, name: ''})
    const [orderId, setOrderId] = useState(null)
    const [status, setStatus] = useState(0)
    const [username, setUsername] = useState('')

    // const reload = async () => {
    //     await getBasketList((result) => {
    //         let catalogIdList = catalogList.map(cat => {
    //             return cat.structurePageId === pageId ? cat.id : null
    //         }).filter(cat => cat !== null)
    //
    //         setBasket(result.map(item => {
    //             return catalogIdList.includes(item.catalogId) ? item : null
    //         }).filter(item => item !== null))
    //     }, user.id)
    // }

    if (status === 2) {
        return (<div style={{flexDirection: 'column', display: 'flex'}}>
            <div className={style['happyDuck']}/>
            <div className={style['label']}>{'Заказ №' + String(orderId) + ' успешно оформлен.'}</div>
            <div className={style['label']} style={{marginBottom: '5vw'}}>
                Совсем скоро с Вами свяжется наш менеджер - @gwstore_admin для оплаты и активации Вашего заказа.
            </div>
            <a className={style['linkElement']}
               href={'https://t.me/gwstore_admin'}>
                <button className={style['button']} style={{background: '#50A355'}}>
                    Написать менеджеру
                </button>
            </a>
            <Link to={'/'} className={style['linkElement']}>
                <button className={style['button']} style={{background: '#454545'}}>
                    Вернуться на главную
                </button>
            </Link>
        </div>)
    } else if (status === 1) {
        return (<div style={{flexDirection: 'column', display: 'flex'}}>
            <div className={style['secretDuck']}/>
            <div className={style['label']} style={{marginBottom: '5vw'}}>
                Упс, у Вас скрытый никнейм в Telegram, мы не можем написать Вам, уточните, пожалуйста, свой никнейм в
                поле ниже
            </div>
            <div className={style['usernameInput']}>
                <input placeholder={'Ваш никнейм Telegram'} onChange={e => setUsername(e.target.value)}/>
            </div>
            <button className={style['button']} onClick={() => {
                if (username !== '') {
                    createOrder(accountData, {id: user.id, username: '@'+ username}, pageId, promoData.name, ((res) => {
                        setOrderId(res.number)
                        setStatus(2)
                    })).then()
                }
            }} style={{background: username !== '' ? '#50A355' : '#454545', transitionProperty: 'background', transitionDuration: '0.3s', transitionTimingFunction:'ease-in-out'}}>
                Оформить заказ
            </button>
        </div>)
    } else {
        if (basket !== null) {
            if (basket.length === 0) {
                return (<div className={style['emptyBasket']}>
                    <div/>
                    <div>В корзине ничего нет</div>
                    <div className={style['button']} onClick={() => {
                        navigate(window.location.pathname.replace('basket', ''));
                    }}>перейти к покупкам
                    </div>
                </div>)
            } else if (basket.length > 0) {

                return (<div className={style['mainContainer']}
                             style={{paddingBottom: String(window.innerWidth * 0.20 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom + (window.screen.availHeight - window.innerHeight) + 10) + 'px'}}>
                    <div className={style['title']}>Ваша корзина</div>
                    {basket.map(item => (<ProductItemBasket product={item} onReload={()=>{updateBasket(catalogList, pageId)}}/>))}
                    {pageId !== 29 ? <AccountData returnAccountData={setAccountData}/> : ''}
                    {<Promo setPromoData={setPromoData}/>}
                    <div className={style['total']}>
                        <div>
                            <div>Итого к оплате:</div>
                            <div>{basket.map(el => {
                                return el.similarCard !== null ? el.similarCard.price : el.price
                            }).reduce((accumulator, currentValue) => accumulator + currentValue, 0) * (1 - promoData.percent / 100)}₽
                            </div>
                            {promoData.percent > 0 ? <div>
                                {basket.map(el => {
                                    return el.similarCard !== null ? el.similarCard.price : el.price
                                }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)}₽
                            </div> : ''}
                        </div>
                        <div onClick={() => {
                            if (typeof user.username !== 'undefined') {
                                createOrder(accountData, user, pageId, promoData.name, ((res) => {
                                    setOrderId(res.number)
                                    setStatus(2)

                                })).then()
                            } else {
                                setStatus(1)
                            }
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
    }
};

export default Basket;