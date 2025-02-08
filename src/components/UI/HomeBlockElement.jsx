import React from 'react';
import {Link} from "react-router-dom";

const HomeBlockElement = ({path, data}) => {

    let oldPrice = ''
    let parcent = ''
    if (typeof data.body.oldPrice === 'undefined') {
        if (typeof data.body.releaseDate === 'undefined') {
            parcent = ''
        } else {
            parcent = data.body.releaseDate.replace('#', '')
        }
    } else {
        oldPrice = String(data.body.oldPrice) + ' ₽'
        parcent = '−'+String(Math.ceil((1-data.body.price/data.body.oldPrice)*100))+'%'
    }
    let parcentEl = (<div></div>)
    if(parcent !== ''){
        parcentEl = (<div style={{
            lineHeight: '20px',
            background: '#ff5d5d',
            paddingLeft: '3px',
            paddingRight: '3px',
            borderRadius: '5px',
            marginBottom: '5px',
            textDecoration: 'none',
            textAlign: 'left',
            marginRight: '5px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            overflow: 'hidden',
            color: 'white',
            width: 'max-content'
        }}>{parcent}</div>)
    }

    let dataRelease = ''
    if (typeof data.body.releaseDate === 'undefined') {

    } else {
        dataRelease = data.body.releaseDate.replace('#', '')
    }

    let view = ''
    if (typeof data.body.view === 'undefined') {
        view = ''
    } else {
        view = ' ' + data.body.view
    }

    return (
        <div className={'home-block-element'}>
            <Link to={'/card/' + data.id} className={'link-element'}>
                <div className={'box-home-block-element'}>
                    <div style={{
                        backgroundImage: 'url("' + data.body.img + '+")',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        display:'flex',
                        flexDirection:'row',
                        alignItems:'end',
                        justifyContent: 'space-between',
                    }} className={'img-home'}>
                        <div style={{
                            lineHeight: '20px',
                            background: '#191919',
                            paddingLeft: '3px',
                            paddingRight: '3px',
                            borderRadius: '5px',
                            marginBottom: '5px',
                            textDecoration: 'none',
                            textAlign: 'left',
                            marginLeft: '5px',
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 700,
                            fontSize: '12px',
                            overflow: 'hidden',
                            color: 'white',
                            width: 'max-content'
                        }}>{data.body.platform}</div>
                        {parcentEl}
                    </div>
                    <div style={{height: '37px', overflow: 'hidden'}}>
                        <div className={'text-element name-element'}>{data.body.title + view}</div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'left'}}>
                        <div className={'text-element price-element'}
                             style={{fontSize: '14px'}}>{String(data.body.price) + ' ₽'}</div>
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