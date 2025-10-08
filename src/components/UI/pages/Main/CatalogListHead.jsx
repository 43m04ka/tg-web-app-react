import React, {useEffect, useState} from 'react';

import {Swiper, SwiperSlide} from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import {Autoplay, Pagination, Controller, EffectCoverflow} from 'swiper/modules';
import {useNavigate} from "react-router-dom";
import {useServer} from "../../../../hooks/useServer";
import useGlobalData from "../../../../hooks/useGlobalData";

let realIndex = 0
let lastPageID = -1
const CatalogListHead = () => {
    const {catalogStructureList, pageId} = useGlobalData()
    let data = []
    if(catalogStructureList !== null) {
         data = catalogStructureList.filter(item => item.structurePageId === pageId && item.group === 'head').sort((a, b) => {
            return a.serialNumber - b.serialNumber
        })
    }

    if (lastPageID !== pageId) {
        lastPageID = pageId;
        // getCatalogs(pageId, 'head', setData).then()
    }

    const [number, setNumber] = useState(0);
    const navigate = useNavigate();

    const pagination = {
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '"></span>';
        },
    };

    const onIndexChange = (index) => {
        setNumber(index)
        realIndex = index
    }

    let loop = false
    if (data.length > 3) {
        loop = true
    }

    if (data.length > 0) {
        return (
            <div style={{width: '100%', overflowX: 'hidden', marginBottom: '20px'}}>
                <Swiper slidesPerView={3} className="swiper"
                        style={{
                            width: String(window.innerWidth * 0.5 * 3 + 14) + 'px',
                            marginLeft: '-' + String((window.innerWidth * 0.5 * 3 + 14 - window.innerWidth) / 2) + 'px'
                        }}
                        spaceBetween={7}
                        centeredSlides={true}
                        effect={'coverflow'}
                        onActiveIndexChange={(ev) => {
                            onIndexChange(ev.realIndex)
                        }}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 10,
                            depth: 100,
                            modifier: 0.1,
                            slideShadows: false,
                            scale: 0.73
                        }}
                        autoplay={{
                            delay: 7000,
                            disableOnInteraction: false,
                        }}
                        pagination={pagination}
                        loop={loop}
                        modules={[Autoplay, Pagination, Controller, EffectCoverflow]}
                        onClick={(ev) => {
                            setNumber(ev.touches.currentX)

                            let path

                            if (ev.touches.currentX > window.innerWidth * 0.75) {
                                if (realIndex !== data.length - 1) {
                                    path = data[realIndex + 1].path
                                } else {
                                    path = data[0].path
                                }
                            } else if (ev.touches.currentX < window.innerWidth * 0.25) {
                                if (realIndex !== 0) {
                                    path = (data[realIndex - 1].path)
                                } else {
                                    path = (data[data.length - 1].path)
                                }
                            } else {
                                path = (data[realIndex].path)
                            }

                            if(path.includes('https')){
                                window.open(path)
                            }else{
                                navigate(path)
                            }
                        }}
                >
                    {data.map((el) => {
                        return (<SwiperSlide key={el.id}>
                            <div style={{zIndex: '50'}}>
                                <div style={{
                                    width: String(window.innerWidth * 0.5) + 'px',
                                    height: String(window.innerWidth * 0.5 * 800 / 560) + 'px',
                                    marginBottom: '20px',
                                    marginLeft: '0',
                                    justifyContent: 'left',
                                    marginRight: '0',
                                    backgroundImage: "url('" + el.url + "')",
                                    backgroundSize: 'cover',
                                    borderRadius: '10px',
                                }}/>
                            </div>
                        </SwiperSlide>)
                    })}
                </Swiper>
            </div>
        );
    } else {
        return (
            <div style={{width: String(window.innerWidth) + 'px', overflowX: 'hidden', marginBottom: '20px'}}>
                <Swiper slidesPerView={3} className="swiper"
                        style={{
                            width: String(window.innerWidth * 0.5 * 3 + 14) + 'px',
                            marginLeft: '-' + String((window.innerWidth * 0.5 * 3 + 14 - window.innerWidth) / 2) + 'px'
                        }}
                        spaceBetween={7}
                        centeredSlides={true}
                        effect={'coverflow'}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 10,
                            depth: 100,
                            modifier: 0.1,
                            slideShadows: false,
                            scale: 0.73
                        }}
                        pagination={pagination}
                        loop={true}
                        modules={[Autoplay, Pagination, Controller, EffectCoverflow]}
                >
                    {[1, 2, 3, 4, 5,].map((el) => {
                        return (<SwiperSlide key={el}>
                            <div style={{zIndex: '50'}}>
                                <div style={{
                                    width: String(window.innerWidth * 0.5) + 'px',
                                    height: String(window.innerWidth * 0.5 * 800 / 560) + 'px',
                                    marginBottom: '20px',
                                    marginLeft: '0',
                                    justifyContent: 'left',
                                    marginRight: '0',
                                    background: "#373737",
                                    borderRadius: '10px',
                                }}/>
                            </div>
                        </SwiperSlide>)
                    })}
                </Swiper>
            </div>
        );
    }
};

export default CatalogListHead;
