import React from 'react';
import style from  "./Payment.module.scss";

const Payment = () => {

    const [selected, setSelected] = React.useState(0);

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
                        Сплит
                    </p>
                </button>
                <button className={style[selected === 2 ? 'activeButton' : 'noActiveButton']} onClick={() => setSelected(2)}>
                    <div/>
                    <p>
                        Долями
                    </p>
                </button>
            </div>
            <div>

            </div>
            <p>

            </p>
        </div>
    );
};

export default Payment;