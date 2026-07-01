import React from 'react';
import style from '../Basket.module.scss';
import { useTelegram } from '../../../hooks/useTelegram';

const OrderContact = ({
    username,
    setUsername,
    inputRef
}) => {
    const {isVk, isTg, isWeb, user} = useTelegram();

    if (isVk) {
        return null;
    }

    if (isTg && typeof user.username === 'undefined') {
        return (<>
            <div className={style['usernameLabel']}>
                Введите Ваш никнейм в Telegram, чтобы мы могли связаться с Вами после оформления заказа
            </div>
            <input className={style['usernameInput']} ref={inputRef}
                   placeholder={'Пример — gwstore_admin'} value={username}
                   onChange={e => {
                       setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''));
                   }}/>
        </>);
    }

    if (isWeb) {
        return (<>
            <div className={style['usernameLabel']}>
                Введите удобный контакт: VK, Telegram, email или номер телефона
            </div>
            <input className={style['usernameInput']} ref={inputRef}
                   placeholder={'Пример — @username, mail@example.com, +79990000000'} value={username}
                   onChange={e => {
                       setUsername(e.target.value);
                   }}/>
        </>);
    }

    return null;
};

export default OrderContact;
