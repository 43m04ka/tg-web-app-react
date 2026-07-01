import {useEffect, useState} from 'react';
import style from './CatalogItem.module.scss';
import {useNavigate} from "react-router-dom";

const CatalogItem = ({product, isClicked, from, embedInGrid}) => {
    const navigate = useNavigate()

    let typeLabel = null

    if(product.type === 'ADD_ON'){
        typeLabel = 'DLC'
    }
    if(product.type === 'GAME'){
        typeLabel = 'Игра'
    }
    if(product.type === 'DONATION'){
        typeLabel = 'Донат'
    }
    if(product.type === 'SUBSCRIPTION'){
        typeLabel = 'Подписка'
    }
    if(product.type === 'CODE'){
        typeLabel = 'Код'
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


    const rootClass = [style['catalogItem'], embedInGrid ? style['catalogItemEmbed'] : ''].filter(Boolean).join(' ');

    return (<div className={rootClass}>
        <div>
            <div className={style['imgPlaceholder']}/>
            {imageLoaded && <img className={style['imgLoaded']} src={product.image}/>}
        </div>
        <div onClick={() => {
            navigate(isClicked === false ? null : '/card/' + product.id + (typeof from !== "undefined" ? '?from=' + from : ''))
        }} className={style['gradient']}>
            <div className={style['platform']}>
                <div className={style['platformStart']}>
                    {product.platform !== null && product.platform !== '' ? (
                        <div className={style['platformBadge']}>{product.platform}</div>
                    ) : null}
                </div>
                <div className={style['platformSpacer']} aria-hidden="true"/>
                <div className={style['platformEnd']}>
                    {percent !== '' && percent.charAt(0) !== '−' ? (
                        <div className={style['parcent']}>{percent}</div>
                    ) : null}
                    {typeLabel !== null ? (
                        <div className={style['platformBadge']}>{typeLabel}</div>
                    ) : null}
                </div>
            </div>
            <div className={style['cardName']}>
                <p>
                    {product.name + (product.choiceRow !== null ? ' ' + product.choiceRow : '')}
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
