import React from 'react';
import style from "./NamePlace.module.scss";

const NamePlace = ({productData}) => {


    let year = null

    if(productData.releaseDate !== null) {
        if (productData.releaseDate !== null && !Number.isNaN(Number(productData.releaseDate)) && productData.releaseDate.trim() !== "" || (new Date(productData.releaseDate)).getFullYear() < 1980) {
            let a = (new Date(productData.releaseDate)) * 24 * 60 * 60 * 1000
            let currentDate = new Date('1899-12-30T00:00:00.000Z')
            let newDate = new Date(a + currentDate.getTime());

            if (newDate > ((new Date()))) {
                year = newDate.getFullYear()
            }
        } else {
            year = (new Date(productData.releaseDate)).getFullYear()
        }
    }

    let infoLabelArray = []

    if(year !== null){
        infoLabelArray.push(year)
    }
    if(productData.genre !== null && productData.genre !== ''){
        infoLabelArray.push(productData.genre)
    }
    if(productData.platform !== null && productData.platform !== ''){
        infoLabelArray.push(productData.platform)
    }
    if(productData.typeLabel !== null && productData.typeLabel !== ''){
        infoLabelArray.push(productData.typeLabel)
    }

    return (
        <div className={style['namePlace']}>
            <div className={style['productImage']} style={{backgroundImage: 'url("' + productData.image + '")'}}/>
            <div>
                <p className={style['title']}>{productData.name}</p>
                <p className={style['infoLabel']}>{infoLabelArray.join(' • ')}</p>
            </div>
        </div>
    );
};

export default NamePlace;