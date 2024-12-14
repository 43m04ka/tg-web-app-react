import React from 'react';
import {Link} from "react-router-dom";

const Basket = (data) => {
    if(data === [0]){
        return (
            <div>Нет запроса</div>
        );
    }else{
        return (<div>
            {data[0]}
        </div>)
    }
};

export default Basket;