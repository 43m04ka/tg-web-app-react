import React, {useEffect, useState} from 'react';
import style from "../../Product.module.scss";
import {useTelegram} from "../../../../../../hooks/useTelegram";

const ImageSlider = ({src, setSelectedId, onBack, i}) => {

    const [imageLoaded, setImageLoaded] = useState(false);
    const {tg}= useTelegram()

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setImageLoaded(true);
        };
    }, [src]);

    if (imageLoaded) {
        return (<img src={src} className={style['descriptionImage']} onClick={() => {
                setSelectedId(i)
                tg.BackButton.show();
                tg.onEvent('backButtonClicked', () => {
                    onBack()
                });
                return () => {
                    tg.offEvent('backButtonClicked', () => {
                        onBack()
                    })
                }
            }}/>);
    } else {
        return (<div className={style['descriptionImage'] + ' ' + style['backgroundImagePreloader']}/>)
    }
};

export default ImageSlider;