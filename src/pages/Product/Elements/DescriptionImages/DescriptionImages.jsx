import React, {useEffect} from 'react';
import {Swiper, SwiperSlide} from "swiper/react";
import style from '../../Product.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import ImageSlider from "./ImageSlider";

const DescriptionImages = ({data}) => {

    const {tg} = useTelegram()
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = React.useState(null);
    const onClose = () => setSelectedId(null);

    useEffect(() => {
        if (selectedId === null) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedId]);

    useEffect(() => {
        if (selectedId !== null) {
            tg.BackButton.hide();

            return () => {
                tg.BackButton.show();
            };
        }

        tg.BackButton.show();

        return undefined;
    }, [selectedId, tg]);

    const onBack = () => {
        return selectedId === null ? navigate(-1) : setSelectedId(null)
    }

    if (data !== null && typeof data !== "undefined" && data.length !== 0) {
        return (<div style={{width: '100vw', minHeight: '45vw', overflowX: 'hidden'}}>
            <Swiper
                slidesPerView={3}
                centeredSlides={true}
                spaceBetween={-15}
                style={{marginLeft: '-60vw', width: '220vw'}}
                loop={data.length > 3}
            >
                {data.map((el, index) => (<SwiperSlide key={index} className={style['slide']}>
                    <ImageSlider src={el} setSelectedId={setSelectedId} onBack={onBack} i={index}/>
                </SwiperSlide>))}
            </Swiper>
            {selectedId !== null ? <div onClick={onClose} className={style['bigSlide']}>
                <button
                    className={style['descriptionImageClose']}
                    onClick={onClose}
                    aria-label="Закрыть изображение"
                >
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M6 18L18 6M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <img
                    src={data[selectedId]}
                    className={style['descriptionImageOpen']}
                    onClick={(event) => event.stopPropagation()}
                />
            </div> : ''}

        </div>);
    }
};

export default DescriptionImages;
