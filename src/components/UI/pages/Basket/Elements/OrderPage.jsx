import React, {useEffect, useState} from 'react';
import style from "./OrderPage.module.scss";
import {useNavigate} from "react-router-dom";
import {useTelegram} from "../../../../../hooks/useTelegram";

const OrderPage = ({orderData}) => {

    const {number, list, summa} = orderData
    const {tg} = useTelegram()

    const [stage, setStage] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setStage(1)
        }, 1350)
        setTimeout(()=>{
            window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }, 750)
    }, [])

    return (<div className={style['container']}>
        {stage === 0 ? (<>
            <div className={style['golo']}>
                <div/>
            </div>
            <div className={style['orderPageContainer']}/>
        </>) : (<div className={style['orderPage']} style={{
            paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
            paddingBottom: String(window.innerWidth * 0.15 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px',
        }}>
            <div>
                <div className={style['title']}>{'Заказ №' + String(number) + ' успешно оформлен!'}</div>
                <div className={style['miniTitle']} style={{marginBottom:'3vw'}}>Состав заказа:
                </div>
                <div style={{maxHeight: String(window.innerWidth * 0.80)  + 'px', overflowY:'scroll'}}>
                    {list.map((item, index) => {
                        return (<>
                            <div className={style['orderPosition']} key={index}>
                                <div style={{backgroundImage: `url(${item.image})`}}/>
                                <div>
                                    <p>
                                        {item.name}
                                    </p>
                                    <p>
                                        {item.platform !== null ? 'для ' + item.platform : ''}
                                    </p>
                                    <p>
                                        {item.similarCard !== null ? item.similarCard.price : item.price} ₽
                                    </p>
                                </div>
                            </div>
                            {list.length - 1 > index ? (<div className={style['separator']}/>) : ''}</>)
                    })}
                </div>
                <div className={style['miniTitle']}>Сумма: {summa} ₽
                </div>
            </div>
            <div>
                <div className={style['label']}>
                    Для оплаты и активации заказа с Вами свяжется наш менеджер @gwstore_admin.
                    <br/>Рабочее время с 10:00 до 22:00 по МСК.
                    <br/>Вы можете задать вопрос по заказу по кнопке ниже.
                </div>
                <button onClick={() => {
                    window.open('https://t.me/gwstore_admin')
                }} className={style['button']} style={{background: '#414143'}}>
                    Поддержка магазина
                </button>
            </div>
            <div className={style['mainMenuButton']} onClick={() => {
                navigate('/')
            }}>
                <p>Вернуться на главную</p>
            </div>
        </div>)}


        {/*<div style={{flexDirection: 'column', display: 'flex'}}>*/}
        {/*    <div className={style['happyDuck']}/>*/}
        {/*    <div className={style['label']}>{'Заказ №' + String(orderId) + ' успешно оформлен.'}</div>*/}
        {/*    <div className={style['label']} style={{marginBottom: '5vw'}}>*/}
        {/*        Совсем скоро с Вами свяжется наш менеджер - @gwstore_admin для оплаты и активации Вашего*/}
        {/*        заказа.*/}
        {/*    </div>*/}
        {/*    <a className={style['linkElement']}*/}
        {/*       href={'https://t.me/gwstore_admin'}>*/}
        {/*        <button className={style['button']} style={{background: '#50A355'}}>*/}
        {/*            Написать менеджеру*/}
        {/*        </button>*/}
        {/*    </a>*/}
        {/*    <Link to={'/'} className={style['linkElement']}>*/}
        {/*        <button className={style['button']} style={{background: '#454545'}}>*/}
        {/*            Вернуться на главную*/}
        {/*        </button>*/}
        {/*    </Link>*/}
        {/*</div>*/}

    </div>);
};

export default OrderPage;