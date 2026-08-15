// noinspection JSUnusedLocalSymbols

import React, {useState} from 'react';
import style from '../Basket.module.scss';
import {usePlatform} from "../../../hooks/utils/usePlatform";
import {usePlatformUser} from "../../../hooks/usePlatformUser";

const OrderContact = ({
    username,
    setUsername,
    inputRef,
    email,
    setEmail,
    showEmailField = true
}) => {
    const [emailError, setEmailError] = useState('');
    const { user } = usePlatformUser();
    const { isVk, isTg, isWeb, botType } = usePlatform();

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
    };

    const handleEmailBlur = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email.trim())) {
            setEmailError('некорректный Email');
        } else {
            setEmailError('');
        }
    };

    if (isVk) {
        if (!showEmailField) return null;
        return (<>
            <div className={style['usernameLabel']}>Чек оплаты поступит на Ваш Email:</div>
            <input className={style['usernameInput']}
                   placeholder={'mail@example.com'} value={email}
                   onChange={handleEmailChange}
                   onBlur={handleEmailBlur}
                   style={{borderColor: emailError ? '#ff0000' : ''}}
            />
            {emailError && <div className={style['errorText']}>{emailError}</div>}
        </>);
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
            {showEmailField && <>
                <div className={style['usernameLabel']} style={{marginTop: '12px'}}>Чек оплаты поступит на Ваш Email:</div>
                <input className={style['usernameInput']}
                       placeholder={'mail@example.com'} value={email}
                       onChange={handleEmailChange}
                       style={{borderColor: emailError ? '#ff0000' : ''}}
                />
                {emailError && <div className={style['errorText']}>{emailError}</div>}
            </>}
        </>);
    }

    if (isTg) {
        if (!showEmailField) return null;
        return (<>
            <div className={style['usernameLabel']}>Чек оплаты поступит на Ваш Email:</div>
            <input className={style['usernameInput']}
                   placeholder={'mail@example.com'} value={email}
                   onChange={handleEmailChange}
                   onBlur={handleEmailBlur}
                   style={{borderColor: emailError ? '#ff0000' : ''}}
            />
            {emailError && <div className={style['errorText']}>{emailError}</div>}
        </>);
    }

    if (isWeb) {
        return (<>
            <div className={style['usernameLabel']}>
                Введите удобный контакт: VK, Telegram или номер телефона
            </div>
            <input className={style['usernameInput']} ref={inputRef}
                   placeholder={'Пример — @username, +79990000000'} value={username}
                   onChange={e => {
                       setUsername(e.target.value);
                   }}/>
            {showEmailField && <>
                <div className={style['usernameLabel']} style={{marginTop: '12px'}}>Чек оплаты поступит на Ваш Email:</div>
                <input className={style['usernameInput']}
                       placeholder={'mail@example.com'} value={email}
                       onChange={handleEmailChange}
                       style={{borderColor: emailError ? '#ff0000' : ''}}
                />
                {emailError && <div className={style['errorText']}>{emailError}</div>}
            </>}
        </>);
    }

    return null;
};

export default OrderContact;
