import React from 'react';
import style from "./PositionCounter.module.scss";

const PositionCounter = () => {

    const [counter, setCounter] = React.useState(1);

    return (<div className={style['productBasketCounter']}>
        <p>{counter} шт.</p>
        <div>
            <div onClick={() => {
                setCounter(counter - 1)
            }}>
                <p>-</p>
            </div>
            <div onClick={() => {
                setCounter(counter + 1)
            }}>
                <p>+</p>
            </div>
        </div>
    </div>);
};

export default PositionCounter;