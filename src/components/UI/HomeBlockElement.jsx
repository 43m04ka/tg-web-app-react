import React from 'react';
import {Link} from "react-router-dom";

const HomeBlockElement = ({path, data}) => {

    let oldPrice = ''
    if (typeof data.oldPrice === 'undefined') {
        oldPrice = ''
    } else {
        oldPrice = String(data.oldPrice) + ' ₽'
    }

    let dataRelease = ''
    if (typeof data.release === 'undefined') {
        dataRelease = ''
    } else {
        const val = data.release * 1000000;
        const msecsPerDay = 24 * 60 * 60 * 1000;
        const ms = Math.round(val / 1E+6 * msecsPerDay);
        const start = new Date(1900, 0, 1);
        const date = new Date(ms + start.valueOf());
        console.log(date.toString());
    }

    let view = ''
    if (typeof data.view === 'undefined') {
        view = ''
    } else {
        view = ' ' + data.view
    }

    return (
        <div className={'home-block-element'}>
            <Link to={'/card/'  + data.id} className={'link-element'}>
                <div className={'box-home-block-element'}>
                    <div style={{
                        backgroundImage: 'url("' + data.img + '+")',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        alignContent: 'end',
                        justifyItems: 'left'
                    }} className={'img-home'}>
                        <div style={{
                            lineHeight: '20px',
                            background: '#191919',
                            paddingLeft: '3px',
                            paddingRight: '3px',
                            borderRadius: '5px',
                            marginBottom: '5px',
                            textDecoration: 'none',
                            textAlign:'left',
                            marginLeft:'5px',
                            fontFamily:"'Montserrat', sans-serif",
                            fontWeight:700,
                            fontSize:'12px',
                            overflow:'hidden',
                            color:'white',
                            width:'max-content'
                        }}>{data.platform}</div>
                    </div>
                    <div style={{height: '37px', overflow: 'hidden'}}>
                        <div className={'text-element name-element'}>{data.title+view}</div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'left'}}>
                        <div className={'text-element price-element'}
                             style={{fontSize: '14px'}}>{String(data.price) + ' ₽'}</div>
                        <div className={'text-element price-element'}
                             style={{textDecoration: 'line-through', color: 'gray', fontSize: '14px'}}>{oldPrice}</div>
                        {/*<div className={'text-element price-element'}*/}
                        {/*     style={{textDecoration: 'line-through', color: 'gray'}}>{dataRelease}</div>*/}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default HomeBlockElement;