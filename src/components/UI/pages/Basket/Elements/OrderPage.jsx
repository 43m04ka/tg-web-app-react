import React, {useEffect, useState} from 'react';
import style from "./OrderPage.module.scss";
import {useNavigate} from "react-router-dom";

const OrderPage = ({orderId, positionList}) => {

    const [stage, setStage] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setStage(1)
        }, 1350)
    }, [])

    return (<div className={style['container']}>
        {stage === 0 ? (<>
            <div className={style['golo']}>
                <div/>
            </div>
            <div className={style['orderPageContainer']}/>
        </>) : (<div className={style['orderPage']}>
            <div className={style['happyDuck']}/>
            <div>
                <div className={style['label']} style={{
                    fontSize: '4.3vw',
                    marginBottom: '3vw'
                }}>{'Заказ №' + String(orderId) + ' успешно оформлен.'}</div>
                {positionList.map((item, index) => {
                    return (<>
                        <div className={style['orderPosition']} key={index}>
                            <div style={{backgroundImage: `url(${item.image})`}}/>
                            <div>
                                <p>
                                    {item.name}
                                </p>
                                <p>
                                    {item.similarCard !== null ? item.similarCard.price : item.price} ₽
                                </p>
                            </div>
                        </div>
                        {positionList.length - 1 > index ? (<div className={style['separator']}/>) : ''}</>)
                })}
            </div>
            <div>
                <div className={style['label']}>
                    Совсем скоро с Вами свяжется наш менеджер - @gwstore_admin для оплаты и активации Вашего
                    заказа.
                </div>
                <button onClick={()=>{window.open('https://t.me/gwstore_admin')}} className={style['button']} style={{background: '#414143'}}>Написать менеджеру</button>
            </div>
            <div className={style['mainMenuButton']} onClick={()=>{navigate('/')}}>
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