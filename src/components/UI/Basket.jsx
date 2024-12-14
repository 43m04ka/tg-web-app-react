import React from 'react';
import {Link} from "react-router-dom";

const Basket = (data) => {
    if(data === ' '){
        return (
            <div>Нет запроса</div>
        );
    }else{
        return (<div>{data.join(' ')}
        </div>)
    }
};

export default Basket;