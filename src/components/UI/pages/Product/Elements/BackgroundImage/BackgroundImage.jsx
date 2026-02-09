import React, {useEffect, useState} from 'react';
import style from './BackgroundImage.module.scss'
import StarRating from "../InfoBubbles/StarRaiting/StarRating";

const BackgroundImage = ({productData, selectCardList}) => {

    const [imageLoaded, setImageLoaded] = useState(false);
    const [isLoadedLogo, setIsLoadedLogo] = useState(false);

    useEffect(() => {
        if (productData !== null) {
            const img = new Image();
            img.src = productData.backgroundUrl !== null ? productData.backgroundUrl : productData.image;
            img.onload = () => {
                setImageLoaded(true);
            };
        }
    }, [productData?.image]);


    let endDatePromotion = ''
    let percent = ''

    if (productData.endDatePromotion !== null) {
        if (!Number.isNaN(Number(productData.endDatePromotion)) && productData.endDatePromotion.trim() !== "") {
            endDatePromotion = `*до ${(new Date(Number(productData.endDatePromotion))).toLocaleDateString('ru-RU')}`
        } else {
            endDatePromotion = `*до ${productData.endDatePromotion}`
        }
    }

    if (productData.oldPrice !== null) {
        percent = '-' + Math.ceil((1 - productData.price / productData.oldPrice) * 100) + '%'
    } else if (productData.similarCard !== null) {
        if (typeof productData.similarCard.oldPrice !== 'undefined') {
            percent = '-' + Math.ceil((1 - productData.similarCard?.price / productData.similarCard?.oldPrice) * 100) + '%'
        }
        if (typeof productData.similarCard.endDatePromotion !== 'undefined') {
            if (!Number.isNaN(Number(productData.similarCard?.endDatePromotion)) && productData.similarCard?.endDatePromotion.trim() !== "") {
                endDatePromotion = `*до ${(new Date(Number(productData.similarCard?.endDatePromotion))).toLocaleDateString('ru-RU')}`
            } else {
                endDatePromotion = `*до ${productData.similarCard?.endDatePromotion}`
            }
        }
    }

    if (productData.releaseDate !== null && !Number.isNaN(Number(productData.releaseDate)) && productData.releaseDate.trim() !== "" || (new Date(productData.releaseDate)).getFullYear() < 1980) {
        let a = (new Date(productData.releaseDate)) * 24 * 60 * 60 * 1000
        let currentDate = new Date('1899-12-30T00:00:00.000Z')
        let newDate = new Date(a + currentDate.getTime());

        if (newDate > ((new Date()))) {
            percent = newDate.toLocaleDateString('ru-RU')
        }
    }

    let oldPrice = ''
    let price = productData.price.toLocaleString() + ' ₽'


    if (productData.oldPrice !== null) {
        oldPrice = productData.oldPrice.toLocaleString() + ' ₽'
    } else if (productData.similarCard !== null) {
        price = productData.similarCard?.price.toLocaleString() + ' ₽'
        if (typeof productData.similarCard.oldPrice !== 'undefined') {
            oldPrice = productData.similarCard?.oldPrice.toLocaleString() + ' ₽'
        }
    }

    return (<div className={style['image']}>
        {imageLoaded ? <div
                style={{backgroundImage: 'url("' + (productData.backgroundUrl !== null ? productData.backgroundUrl : productData.image) + '")'}}/> :
            <div className={style['backgroundImagePreloader']}/>}

        <div className={style['percent']}>

            {productData.logoUrl !== null ? <img className={style[`logo-${isLoadedLogo ? 'loaded' : 'load'}`]} src={productData.logoUrl}  onLoad={() => setIsLoadedLogo(true)}/> : ''}

            <div>
                {/*<p className={style['typeLabel']}>{productData.typeLabel || ''}</p>*/}

                <div className={style['price']}>
                    <p style={{color: oldPrice !== '' ? '#D86147' : '#ffffff'}}>{price}</p>
                    {oldPrice !== '' ? <p>{oldPrice}</p> : ''}
                </div>
                {percent !== '' ?
                    <div>
                        <div className={style[percent === 'Предзаказ' ? 'preOrder' : 'sale']}/>
                        <p className={style['saleLabel']}>скидка {percent} {endDatePromotion}</p>
                    </div>
                    : ''}
            </div>
        </div>




    </div>)


};

export default BackgroundImage;

// <div className={style['percent']}>
//     <div>
//         <div className={style[percent === 'Предзаказ' ? 'preOrder' : 'sale']}/>
//         <p>{percent}</p>
//     </div>
//     <p>{endDatePromotion}</p>
// </div>

//  backgroundImage: 'url(' + ((selectCardList !== null || !productData.image.includes('?w=')) ? productData.image : productData.image.slice(0, productData.image.indexOf('?w=') + 1) + "w=1024") + ')'