import React, {useEffect, useState} from 'react';
import style from "./OrderPage.module.scss";
import {useNavigate} from "react-router-dom";
import {useTelegram} from "../../../hooks/useTelegram";


const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Ошибка копирования', err);
        }
        document.body.removeChild(textArea);
    }
};

const OrderPage = ({orderData}) => {

    const {number, list, summa, message} = orderData
    const { tg, safeAreaInset, contentSafeAreaInset, isVk, vkGroupId} = useTelegram()

    const [stage, setStage] = useState(0);
    const [openingChat, setOpeningChat] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setStage(1)
        }, 1350)
        setTimeout(()=>{
            window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }, 750)
    }, [])

    useEffect(() => {
        if (stage === 1 && isVk && message) {
            copyToClipboard(message);
        }
    }, [stage, isVk, message])

    const handleOpenVkChat = () => {
        setOpeningChat(true);

        copyToClipboard(message);

        setTimeout(() => {
            const vkLink = `https://vk.com/im?sel=-${vkGroupId}`;
            window.open(vkLink, '_blank');
            setOpeningChat(false);
        }, 100);
    };

    return (<div className={style['container']}>
         {stage === 0 ? (<>
             <div className={style['golo']}>
                 <div/>
             </div>
             <div className={style['orderPageContainer']}/>
         </>) : (<div className={style['orderPage']} style={{
             paddingTop: String(contentSafeAreaInset.top + safeAreaInset.top) + 'px',
             paddingBottom: String(window.innerWidth * 0.15 + contentSafeAreaInset.bottom + safeAreaInset.bottom) + 'px',
         }}>
             <div>
                 <div className={style['title']}>{'Заказ №' + String(number) + ' успешно ' + (isVk ? 'сформирован' : 'оформлен') + '!'}</div>
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

            {isVk ? (
                <div>
                    <div className={style['label']} style={{backgroundColor: 'rgba(0, 122, 255, 0.1)', padding: '2vw', borderRadius: '2vw', border: '1px solid rgba(0, 122, 255, 0.3)', marginBottom: '2vw'}}>
                        ✓ Данные заказа скопированы в буфер обмена
                    </div>
                    <div className={style['label']}>
                            Чтобы оформить Ваш заказ — перейдите в чат сообщества по кнопке ниже и отправьте скопированное сообщение. Менеджер оперативно ответит Вам в рабочее время и оформит заказ.
                    </div>
                    <button 
                        onClick={handleOpenVkChat}
                        disabled={openingChat}
                        className={style['button']} 
                        style={{background: '#4a76a8', opacity: openingChat ? 0.6 : 1, cursor: openingChat ? 'not-allowed' : 'pointer'}}
                    >
                        {openingChat ? 'Данные скопированы, откроется чат...' : 'Перейти в чат сообщества'}
                    </button>
                </div>
            ) : (
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
            )}

            <div className={style['mainMenuButton']} onClick={() => {
                navigate('/')
            }}>
                <p>Вернуться на главную</p>
            </div>
        </div>)}

    </div>);
};

export default OrderPage;
