import {useState, useEffect} from 'react';
import '../../../styles/style.css';
import {Link} from "react-router-dom";
import style from './Catalog.module.scss'

const CatalogItem = ({product, isClicked}) => {

    let oldPrice = ''
    let parcent = ''
    let price = product.price.toLocaleString() + ' ₽'

    if (product.oldPrice !== null) {
        oldPrice = String(product.oldPrice).toLocaleString() + ' ₽'
        parcent = '−' + Math.ceil((1 - product.price / product.oldPrice) * 100) + '%'
    } else if (product.similarCard !== null) {
        price = String(product.similarCard?.price).toLocaleString() + ' ₽'

        if (typeof product.similarCard.oldPrice !== 'undefined') {
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

    let parcentEl = (<div></div>)
    if (parcent !== '') {
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
            fontFamily: 'font-medium',
            fontSize: '12px',
            overflow: 'hidden',
            color: 'white',
            width: 'max-content'
        }}>{parcent}</div>)
    }

    let view = product.choiceRow === null ? '' : ' ' + product.choiceRow

    let platform = (<div></div>)
    if (typeof product.platform !== null && product.platform !== null) {
        platform = (<div style={{
            lineHeight: '20px',
            background: '#191919',
            paddingLeft: '3px',
            paddingRight: '3px',
            borderRadius: '5px',
            marginBottom: '5px',
            textDecoration: 'none',
            textAlign: 'left',
            marginLeft: '5px',
            fontFamily: 'font-medium',
            fontSize: '12px',
            overflow: 'hidden',
            color: 'white',
            width: 'max-content'
        }}>{product.platform}</div>)
    }

    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = product.image;
        img.onload = () => {
            setImageLoaded(true);
        };
    }, [product.url]);


    return (<div className={'list-element'}>
        <Link to={isClicked === false ? null : '/card/' + product.id} className={'link-element'}>
            <div className={'box-home-block-element'}>
                {imageLoaded ? (<div style={{
                    backgroundImage: 'url("' + product.image + '")',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'end',
                    justifyContent: 'space-between',
                }} className={style['productImage']}>
                    {platform}
                    {parcentEl}
                </div>) : (<div className={style['preloadProductImage']}>
                    <svg>
                        <path/>
                    </svg>
                    <svg>
                        <path/>
                    </svg>
                </div>)}

                <div style={{height: '8.5vw', overflow: 'hidden'}}>
                    <div className={'text-element name-element'}>{product.name + view}</div>
                </div>
                <div style={{display: 'flex', justifyContent: 'left'}}>
                    <div className={'text-element price-element'}>{price}</div>
                    <div className={'text-element price-element'}
                         style={{textDecoration: 'line-through', color: 'gray'}}>{oldPrice}</div>
                </div>
            </div>
        </Link>
    </div>);
};

export default CatalogItem;