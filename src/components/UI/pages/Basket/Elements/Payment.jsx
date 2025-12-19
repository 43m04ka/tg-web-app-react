import React from 'react';
import style from  "./Payment.module.scss";

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

const Payment = ({sumPrice}) => {

    const [selected, setSelected] = React.useState(0);


    const options = { month: 'long', day: 'numeric' }
    const date = new Date();
    let dates = [];



    for (let i = 0; i < 14; i++) {
        dates.push(date.addDays(i));
    }

    dates.forEach((date) => {
        console.log(date.toLocaleString('ru-RU', options));
    });

    return (
        <div>
            <div className={style['buttons']}>
                <button className={style[selected === 0 ? 'activeButton' : 'noActiveButton']} onClick={() => setSelected(0)}>
                    <div/>
                    <p>
                        СБП
                    </p>
                </button>
                <button className={style[selected === 1 ? 'activeButton' : 'noActiveButton']} onClick={() => setSelected(1)}>
                    <div/>
                    <p>
                        Яндекс Сплит
                    </p>
                </button>
                <button className={style[selected === 2 ? 'activeButton' : 'noActiveButton']} onClick={() => setSelected(2)}>
                    <div/>
                    <p>
                        Долями
                    </p>
                </button>
            </div>
            {selected === 1 || selected === 2 ?
                (<div className={style['datePlace']}>
                    <div>
                        <p>
                            Сегодня
                        </p>
                        <p>
                            {Math.round(sumPrice/4).toLocaleString()} ₽
                        </p>
                        <div/>
                    </div>
                    <div>
                        <p>
                            {date.addDays(14).toLocaleString('ru-RU', options)}
                        </p>
                        <p>
                            {Math.round(sumPrice/4).toLocaleString()} ₽
                        </p>
                        <div/>
                    </div>
                    <div>
                        <p>
                            {date.addDays(28).toLocaleString('ru-RU', options)}
                        </p>
                        <p>
                            {Math.round(sumPrice/4).toLocaleString()} ₽
                        </p>
                        <div/>
                    </div>
                    <div>
                        <p>
                            {date.addDays(42).toLocaleString('ru-RU', options)}
                        </p>
                        <p>
                            {Math.round(sumPrice/4).toLocaleString()} ₽
                        </p>
                        <div/>
                    </div>
                </div>) : ''}
            <p>

            </p>
        </div>
    );
};

export default Payment;