import {useEffect, useState} from 'react';
import style from './CatalogItem.module.scss';
import {useNavigate} from "react-router-dom";

const CatalogItem = ({product, isClicked, from}) => {
    const navigate = useNavigate()

    let typeLabel = null

    if(product.type === 'ADD_ON'){
        typeLabel = 'DLC'
    }
    if(product.type === 'GAME'){
        typeLabel = 'Игра'
    }
    if(product.typeLabel === 'Виртуальная валюта'){
        typeLabel = 'Донат'
    }

    let percent = ''
    let price = String(product.price).toLocaleString() + ' ₽'

    if (product.oldPrice !== null) {
        percent = '−' + Math.ceil((1 - product.price / product.oldPrice) * 100) + '%'
    } else if (product.similarCard !== null) {
        price = String(product.similarCard?.price).toLocaleString() + ' ₽'

        if (typeof product.similarCard.oldPrice !== 'undefined' && product.similarCard.oldPrice !== null) {
            percent = '−' + Math.ceil((1 - product.similarCard?.price / product.similarCard?.oldPrice) * 100) + '%'
        }
    }

    if (product.releaseDate !== null && !Number.isNaN(Number(product.releaseDate)) && product.releaseDate.trim() !== "" || (new Date(product.releaseDate)).getFullYear() < 1980) {
        let a = (new Date(product.releaseDate)) * 24 * 60 * 60 * 1000
        let currentDate = new Date('1899-12-30T00:00:00.000Z')
        let newDate = new Date(a + currentDate.getTime());

        if (newDate > ((new Date()))) {
            percent = newDate.toLocaleDateString('ru-RU')
        }
    }

    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = product.image;
        img.onload = () => {
            setImageLoaded(true);
        };
    }, [product.url]);


    return (<div className={style['catalogItem']}>
        <div>
            <div style={imageLoaded ? {backgroundImage: 'url("' + product.image + '")'} : {background: '#232323'}}/>
            <div style={imageLoaded ? {backgroundImage: 'url("' + product.image + '")'} : {background: '#232323'}}/>
        </div>
        <div onClick={() => {
            navigate(isClicked === false ? null : '/card/' + product.id + (typeof from !== "undefined" ? '?from=' + from : ''))
        }} className={style['gradient']}>
            <div className={style['platform']}>
                {product.platform !== null && product.platform !== '' ? <div style={{margin: 'auto 1vw auto 0'}}>
                    {product.platform}
                </div> : ''}
                {typeLabel !== null ?
                    <div style={{margin: 'auto auto auto 0'}}>
                        {typeLabel}
                    </div> : ''}
                {percent !== '' && percent.charAt(0) !== '−' ?
                    <div className={style['parcent']} style={{margin: 'auto 0 auto auto'}}>
                        {percent}
                    </div> : ''}
            </div>
            <div className={style['cardName']}>
                <p>
                    {product.name}
                </p>
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <p className={style['cardPrice']}>
                    {price}
                </p>
                {percent !== '' && percent.charAt(0) === '−' ? <div className={style['parcent']}>
                    {percent}
                </div> : ''}
            </div>
        </div>
    </div>);
};

export default CatalogItem;