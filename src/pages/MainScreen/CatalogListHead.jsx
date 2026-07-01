import React, {useEffect, useMemo, useState} from 'react';

import {Swiper, SwiperSlide} from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import {Autoplay, Pagination, Controller, EffectCoverflow} from 'swiper/modules';
import {useNavigate} from "react-router-dom";
import useGlobalData from "../../hooks/useGlobalData";
import {useTelegram} from "../../hooks/useTelegram";
import layout from './CatalogListHead.module.scss';

const DESKTOP_BREAK = 768;
const DESKTOP_CONTENT_MAX = 1400;
const DESKTOP_VISIBLE = 3;
const DESKTOP_GAP = 25;
const DESKTOP_SLIDE_RATIO = 800 / 560;
const MOBILE_SWIPER_GAP_TOTAL = 14;

let realIndex = 0;
let lastPageID = -1;

function useViewportWidth() {
    const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
    useEffect(() => {
        const fn = () => setW(window.innerWidth);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);
    return w;
}

function useHeadSwiperLayout(vw) {
    return useMemo(() => {
        const isDesktop = vw > DESKTOP_BREAK;
        if (isDesktop) {
            const containerW = Math.min(DESKTOP_CONTENT_MAX, vw) * 0.7;
            const totalGaps = DESKTOP_GAP * (DESKTOP_VISIBLE - 1);
            const slideW = Math.floor((containerW - totalGaps) / DESKTOP_VISIBLE);
            const swiperW = slideW * DESKTOP_VISIBLE + DESKTOP_GAP * (DESKTOP_VISIBLE - 1);
            return {
                isDesktop,
                slidesPerView: DESKTOP_VISIBLE,
                spaceBetween: DESKTOP_GAP,
                slideWidth: slideW,
                slideHeight: Math.round(slideW * DESKTOP_SLIDE_RATIO),
                swiperStyle: {
                    width: swiperW + 'px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    overflow: 'visible',
                },
                wrapClass: layout.swiperWrapDesktop,
            };
        }
        const slideW = vw * 0.5;
        const swiperWidth = slideW * 3 + MOBILE_SWIPER_GAP_TOTAL;
        const swiperMarginLeft = -(swiperWidth - vw) / 2;
        return {
            isDesktop,
            slidesPerView: 3,
            spaceBetween: 7,
            slideWidth: slideW,
            slideHeight: Math.round(slideW * DESKTOP_SLIDE_RATIO),
            swiperStyle: {
                width: String(swiperWidth) + 'px',
                marginLeft: String(swiperMarginLeft) + 'px',
                marginRight: '0',
            },
            wrapClass: layout.swiperWrap,
        };
    }, [vw]);
}

const CatalogListHead = () => {
    const {catalogStructureList, pageId} = useGlobalData();
    const {safeAreaInset, contentSafeAreaInset} = useTelegram();
    const vw = useViewportWidth();
    const {isDesktop, slideWidth, slideHeight, swiperStyle, wrapClass, slidesPerView, spaceBetween} =
        useHeadSwiperLayout(vw);
    const [, setNumber] = useState(0);
    const navigate = useNavigate();

    let data = [];
    if (catalogStructureList !== null) {
        data = catalogStructureList
            .filter((item) => item.structurePageId === pageId && item.group === 'head')
            .sort((a, b) => a.serialNumber - b.serialNumber);
    }

    if (lastPageID !== pageId) {
        lastPageID = pageId;
    }

    const pagination = {
        clickable: true,
        renderBullet(index, className) {
            return '<span class="' + className + '"></span>';
        },
    };

    const onIndexChange = (index) => {
        setNumber(index);
        realIndex = index;
    };

    let loop = false;
    if (data.length > (isDesktop ? 5 : 3)) {
        loop = true;
    }

    const swiperBlock = (slides) => (
        <Swiper
            slidesPerView={slidesPerView}
            className={`swiper ${isDesktop ? layout.swiperDesktop : ''}`}
            style={swiperStyle}
            spaceBetween={spaceBetween}
            centeredSlides
            effect="coverflow"
            onActiveIndexChange={(ev) => {
                onIndexChange(ev.realIndex);
            }}
            coverflowEffect={isDesktop ? {
                rotate: 0,
                stretch: 0,
                depth: 160,
                modifier: 1,
                slideShadows: false,
                scale: 1,
            } : {
                rotate: 0,
                stretch: 10,
                depth: 100,
                modifier: 0.1,
                slideShadows: false,
                scale: 0.73,
            }}
            autoplay={{
                delay: 7000,
                disableOnInteraction: false,
            }}
            pagination={pagination}
            loop={slides === 'data' ? loop : true}
            modules={[Autoplay, Pagination, Controller, EffectCoverflow]}
            onClick={(ev) => {
                if (slides !== 'data') return;
                setNumber(ev.touches.currentX);

                let path;

                if (ev.touches.currentX > vw * 0.75) {
                    if (realIndex !== data.length - 1) {
                        path = data[realIndex + 1].path;
                    } else {
                        path = data[0].path;
                    }
                } else if (ev.touches.currentX < vw * 0.25) {
                    if (realIndex !== 0) {
                        path = data[realIndex - 1].path;
                    } else {
                        path = data[data.length - 1].path;
                    }
                } else {
                    path = data[realIndex].path;
                }

                if (path.includes('https')) {
                    window.open(path);
                } else {
                    navigate(path);
                }
            }}
        >
            {slides === 'data'
                ? data.map((el) => (
                      <SwiperSlide key={el.id}>
                          <div style={{zIndex: '50'}}>
                              <div
                                  style={{
                                      width: String(slideWidth) + 'px',
                                      height: String(slideHeight) + 'px',
                                      marginBottom: '20px',
                                      marginLeft: '0',
                                      justifyContent: 'left',
                                      marginRight: '0',
                                      backgroundImage: "url('" + el.url + "')",
                                      backgroundSize: 'cover',
                                      borderRadius: '10px',
                                  }}
                              />
                          </div>
                      </SwiperSlide>
                  ))
                : [1, 2, 3, 4, 5].map((el) => (
                      <SwiperSlide key={el}>
                          <div style={{zIndex: '50'}}>
                              <div
                                  style={{
                                      width: String(slideWidth) + 'px',
                                      height: String(slideHeight) + 'px',
                                      marginBottom: '20px',
                                      marginLeft: '0',
                                      justifyContent: 'left',
                                      marginRight: '0',
                                      background: '#373737',
                                      borderRadius: '10px',
                                  }}
                              />
                          </div>
                      </SwiperSlide>
                  ))}
        </Swiper>
    );

    if (data.length > 0) {
        return (
            <div
                className={layout.headRoot}
                style={{marginTop: String(contentSafeAreaInset.top + safeAreaInset.top) + 'px'}}
            >
                <div className={wrapClass}>{swiperBlock('data')}</div>
            </div>
        );
    }

    return (
        <div className={layout.headRoot} style={{marginBottom: '20px'}}>
            <div className={wrapClass}>{swiperBlock('skeleton')}</div>
        </div>
    );
};

export default CatalogListHead;
