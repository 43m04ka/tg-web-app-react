import React from 'react';
import {Link} from "react-router-dom";

const HomeBlockElement = ({path, data}) => {
    return (
        <div className={'home-block-element'}>
            <Link to={'/home/'+path+'/'+data.id}>
                <img src={data.img} alt={data.title} className={'img'}/>
                <div className={'name-block'}>{data.title}</div>
                <div className={'name-block'}>{data.price}</div>
            </Link>
        </div>
    );
};

export default HomeBlockElement;