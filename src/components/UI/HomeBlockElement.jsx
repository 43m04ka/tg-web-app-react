import React from 'react';
import {Link} from "react-router-dom";

const HomeBlockElement = ({path, data}) => {

    let oldPrice = ''
    if(typeof data.old_price === 'undefined') {
        oldPrice = ''
    }else{
        oldPrice = String(data.old_price)+ ' ₽'
    }

    let dataRelease = ''
    if(typeof data.release === 'undefined') {
        dataRelease = ''
    }else{
        const val = data.release*1000000;
        const msecsPerDay = 24 * 60 * 60 * 1000;
        const ms = Math.round(val / 1E+6 * msecsPerDay);
        const start = new Date(1900, 0, 1);
        const date = new Date(ms + start.valueOf());
        console.log(date.toString());
    }

    return (
        <div className={'home-block-element'}>
            <Link to={'/home/' + path + '/' + data.id} className={'link-element'}>
                <div className={'box-home-block-element'}>
                    <div style={{backgroundImage:'url("'+data.img+'+")', backgroundRepeat:'no-repeat', backgroundSize:'cover', paddingTop:'135px', justifyItems:'left'}} className={'img-home'}>
                        <div className={'text-element'} style={{lineHeight:'20px'}}>{data.platform}</div>
                    </div>
                    <div className={'text-element name-element'}>{data.title}</div>
                    <div style={{display: 'flex', justifyContent: 'left'}}>
                        <div className={'text-element price-element'}>{String(data.price) + ' ₽'}</div>
                        <div className={'text-element price-element'}
                             style={{textDecoration: 'line-through', color: 'gray'}}>{oldPrice}</div>
                        {/*<div className={'text-element price-element'}*/}
                        {/*     style={{textDecoration: 'line-through', color: 'gray'}}>{dataRelease}</div>*/}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default HomeBlockElement;