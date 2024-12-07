import React from 'react';
import {Link} from "react-router-dom";

const HomeBlockElement = ({path, data}) => {
    return (
        <div className={'home-block-element'}>
            <Link to={'/home/' + path + '/' + data.id} className={'link-element'}>
                <div className={'box-home-block-element'}>
                    <img src={data.img} alt={data.title} className={'img-home'}/>
                    <div className={'text-element'}>{data.title}</div>
                    <div className={'text-element price-element'}>{String(data.price) + ' ₽'}</div>
                </div>
            </Link>
        </div>
    );
};

export default HomeBlockElement;