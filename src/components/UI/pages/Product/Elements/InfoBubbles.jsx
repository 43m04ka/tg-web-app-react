import React from 'react';
import style from "./InfoBubbles.module.scss";

const InfoBubbles = ({productData, parameters}) => {
    return (
        <div className={style['infoBubbles']}>
            {parameters.filter(item => item.type === 'bubble').map((parameter, index) => {
                if (productData[parameter.key] !== null && productData[parameter.key] !== '') {
                    return (<div key={index}>
                       <p>{typeof parameter.key !== 'function' ? productData[parameter.key] : parameter.key(productData)}</p>
                    </div>)
                }
            })}
        </div>
    );
};

export default InfoBubbles;