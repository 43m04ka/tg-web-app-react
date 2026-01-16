import React, {useEffect, useState} from 'react';
import style from './BackgroundImage.module.scss'

const BackgroundImage = ({productData, selectCardList}) => {

    const [imageLoaded, setImageLoaded] = useState(false);

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
            endDatePromotion = `до ${(new Date(Number(productData.endDatePromotion))).toLocaleDateString('ru-RU')}`
        }else {
            endDatePromotion = `до ${productData.endDatePromotion}`
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
                endDatePromotion = `до ${(new Date(Number(productData.similarCard?.endDatePromotion))).toLocaleDateString('ru-RU')}`
            }else {
                endDatePromotion = `до ${productData.similarCard?.endDatePromotion}`
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

    return (<div className={style['image']}>
        {imageLoaded ? <div
                style={{backgroundImage: 'url("' + (productData.backgroundUrl !== null ? productData.backgroundUrl : productData.image) + '")'}}/> :
            <div className={style['backgroundImagePreloader']}/>}

        {percent !== '' ? <div className={style['percent']}>
            <div>
                <div>
                    <div className={style[percent === 'Предзаказ' ? 'preOrder' : 'sale']}/>
                    <p>{percent}</p>
                </div>
                <p>{endDatePromotion}</p>
            </div>
        </div> : ''}

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