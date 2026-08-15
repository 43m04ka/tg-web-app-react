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
    if(product.type === 'COMPLECT'){
        typeLabel = 'Комплект'
    }

    let percent = ''
    let price = String(Number(product.price)).toLocaleString() + ' ₽'

    if (product.oldPrice !== null && Number(product.oldPrice !== 0)) {
        percent = '−' + Math.ceil((1 - product.price / product.oldPrice) * 100) + '%'
    }

    let validDateExcel = product.releaseDate !== null && !Number.isNaN(Number(product.releaseDate)) && product.releaseDate.trim() !== ""

    const date = new Date(product.releaseDate);
    const isValidDate = !isNaN(date.getTime());

    if(product.releaseDate !== null){
        console.log(String(!Number.isNaN(Number(product.releaseDate))) + String(product.releaseDate.trim() !== "") + product.releaseDate)
    }

    if (validDateExcel || (new Date(product.releaseDate)).getFullYear() < 1980) {
        let a = (new Date(product.releaseDate)) * 24 * 60 * 60 * 1000
        let currentDate = new Date('1899-12-30T00:00:00.000Z')
        let newDate = new Date(a + currentDate.getTime());

        if (newDate > ((new Date()))) {
            percent = newDate.toLocaleDateString('ru-RU')
        }
    }else if(isValidDate && date > new Date(product.updatedAt)){
        percent = new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }).format(date);

        if (date < ((new Date())) && date > new Date(product.updatedAt)) {
            percent = 'В продаже'
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
