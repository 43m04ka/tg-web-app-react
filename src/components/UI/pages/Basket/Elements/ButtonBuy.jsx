import React, {useState} from 'react';
import style from './ButtonBuy.module.scss'
import {useTelegram} from "../../../../../hooks/useTelegram";

const ButtonBuy = ({onBuy, inputUsernameRef, username}) => {

    const {user} = useTelegram()
    const [loader, setLoader] = useState(false)

    return (<button
            className={style['buttonBuy']}
            style={{background: (typeof user.username !== 'undefined' || username !== '' ? '#50A355' : '#7a7a7a')}}
            onClick={() => {
                if (typeof user.username !== 'undefined' || username !== '') {
                    setLoader(true)
                    setTimeout(() => onBuy(() => {
                        setLoader(false)
                    }), 1000)
                } else {
                    inputUsernameRef.current.focus();
                }
            }}>
            <div>Оформить
                заказ
            </div>
            {loader ? <div className={style['containerLoader']}>
                <svg viewBox="25 25 50 50" className={style['containerRotate']}>
                    <circle cx="50" cy="50" r="20" className={style['loader']}></circle>
                </svg>
            </div> : ''}
        </button>);
};

export default ButtonBuy;