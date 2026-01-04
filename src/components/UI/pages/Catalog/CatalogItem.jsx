import {useEffect, useState} from 'react';
import style from './CatalogItem.module.scss';
import {useNavigate} from "react-router-dom";

const CatalogItem = ({product, isClicked, from}) => {
    const navigate = useNavigate()

    let oldPrice = ''
    let parcent = ''
    let price = String(product.price).toLocaleString() + ' ₽'

    if (product.oldPrice !== null) {
        oldPrice = String(product.oldPrice).toLocaleString() + ' ₽'
        parcent = '−' + Math.ceil((1 - product.price / product.oldPrice) * 100) + '%'
    } else if (product.similarCard !== null) {
        price = String(product.similarCard?.price).toLocaleString() + ' ₽'

        if (typeof product.similarCard.oldPrice !== 'undefined' && product.similarCard.oldPrice !== null) {
            parcent = '−' + Math.ceil((1 - product.similarCard?.price / product.similarCard?.oldPrice) * 100) + '%'
            oldPrice = product.similarCard?.oldPrice.toLocaleString() + ' ₽'
        }
    }

    if (product.releaseDate !== null) {
        let a = (new Date(product.releaseDate)) * 24 * 60 * 60 * 1000
        let currentDate = new Date('1899-12-30T00:00:00.000Z')
        let newDate = new Date(a + currentDate.getTime());

        if (newDate < ((new Date()))) {
            parcent = "Релиз"
        } else {
            parcent = newDate.toLocaleDateString('ru-RU')
            parcent = parcent.slice(0, 6) + parcent.slice(8, 10)
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
                <div>
                    {product.platform}
                </div>
                {parcent !== '' && parcent.charAt(0) !== '−' ?
                    <div className={style['parcent']} style={{margin: 'auto 0 auto auto'}}>
                        {parcent}
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
                {parcent !== '' && parcent.charAt(0) === '−' ? <div className={style['parcent']}>
                    {parcent}
                </div> : ''}
            </div>
        </div>
    </div>);
};

export default CatalogItem;