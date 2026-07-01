import React, {useEffect, useState} from 'react';
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import style from "./DesktopDescriptionImages.module.scss";

const DesktopDescriptionImages = ({data}) => {
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (selectedId === null) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSelectedId(null);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedId]);

    if (!data || !data.length) return null;

    return (
        <section className={style.card}>
            <Swiper slidesPerView="auto" spaceBetween={12}>
                {data.map((item, index) => (
                    <SwiperSlide key={`${item}-${index}`} className={style.slideWrap}>
                        <button className={style.slide} onClick={() => setSelectedId(index)}>
                            <img src={item} alt={`Скриншот ${index + 1}`}/>
                        </button>
                    </SwiperSlide>
                ))}
            </Swiper>

            {selectedId !== null && (
                <div className={style.modal} onClick={() => setSelectedId(null)}>
                    <button
                        className={style.closeButton}
                        onClick={() => setSelectedId(null)}
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
                        alt={`Скриншот ${selectedId + 1}`}
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </section>
    );
};

export default DesktopDescriptionImages;
