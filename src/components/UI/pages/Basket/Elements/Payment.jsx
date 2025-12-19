import React from 'react';
import style from "./Payment.module.scss";

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

const Payment = ({sumPrice, setPaymentMethodString}) => {

    const [selected, setSelected] = React.useState(0);
    const [infoLabel, setInfoLabel] = React.useState('');

    if (sumPrice < 2000 && selected !== 0) {
        setSelected(0);
    }

    const options = {month: 'long', day: 'numeric'}
    const date = new Date();

    return (<div>
        <div className={style['title']}>
            Способ оплаты:
        </div>
        <div className={style['buttons']}>
            <button className={style[selected === 0 ? 'activeButton' : 'noActiveButton']}
                    onClick={() => {
                        setSelected(0)
                        setPaymentMethodString('Способ оплаты: СБП')
                        setInfoLabel('')
                    }}>
                <div/>
                <p>
                    СБП
                </p>
            </button>
            <button className={style[selected === 1 ? 'activeButton' : 'noActiveButton']}
                    onClick={() => {
                        if (sumPrice < 2000) {
                            setInfoLabel('Яндекс Сплит доступен при покупке от 2000 руб')
                        } else {
                            setSelected(1)
                            setPaymentMethodString('Способ оплаты: Яндекс Сплит')
                            setInfoLabel('')
                        }
                    }}>
                <div/>
                <p>
                    Яндекс Сплит
                </p>
            </button>
            <button className={style[selected === 2 ? 'activeButton' : 'noActiveButton']}
                    onClick={() => {
                        if (sumPrice < 2000) {
                            setInfoLabel('Оплата Долями доступна при покупке от 2000 руб')
                        } else {
                            setSelected(2)
                            setPaymentMethodString('Способ оплаты: Долями')
                            setInfoLabel('')
                        }
                    }}>
                <div/>
                <p>
                    Долями
                </p>
            </button>
        </div>
        <div style={{
            height: selected === 1 || selected === 2 ? selected === 1 ? '26vw' : '28vw' : '0',
            transition: 'all 0.15s ease-in-out'
        }}>
            {selected === 1 || selected === 2 ? (<>
                <div className={style['datePlace']}>
                    <div>
                        <p>
                            Сегодня
                        </p>
                        <p>
                            {Math.round(sumPrice / 4).toLocaleString()} ₽
                        </p>
                        <div/>
                    </div>
                    <div>
                        <p>
                            {date.addDays(14).toLocaleString('ru-RU', options)}
                        </p>
                        <p>
                            {Math.round(sumPrice / 4).toLocaleString()} ₽
                        </p>
                        <div/>
                    </div>
                    <div>
                        <p>
                            {date.addDays(28).toLocaleString('ru-RU', options)}
                        </p>
                        <p>
                            {Math.round(sumPrice / 4).toLocaleString()} ₽
                        </p>
                        <div/>
                    </div>
                    <div>
                        <p>
                            {date.addDays(42).toLocaleString('ru-RU', options)}
                        </p>
                        <p>
                            {Math.round(sumPrice / 4).toLocaleString()} ₽
                        </p>
                        <div/>
                    </div>
                </div>
                {selected === 1 ?
                    <p className={style['infoLabel']}>График платежей является информационным и может отличаться
                        от конечного при оформлении. <br/> <a href={'https://yandex.ru/legal/yandexpay_b2c/'}>Подробные
                            условия сервиса</a>
                    </p> :
                    <p className={style['infoLabel']}>График платежей является информационным и может отличаться
                        от конечного при оформлении. <br/> Возможен сервисный сбор. <br/> <a
                            href={'https://dolyame.ru/'}>Подробные условия сервиса</a></p>}

            </>) : ''}
        </div>
        <div style={{height: infoLabel !== '' ? '3vw' : '0', transition: 'all 0.15s ease-in-out'}}>
            <p className={style['infoLabel']} style={{marginTop:'3vw'}}>
                {infoLabel}
            </p>
        </div>
    </div>);
};

export default Payment;