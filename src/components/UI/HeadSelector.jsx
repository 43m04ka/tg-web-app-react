import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import basket from "../icons/basket.png";
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';


import {Autoplay, Pagination, Controller, EffectCoverflow} from 'swiper/modules';

let realIndex = 0
let isScroll = false

const HeadSelector = ({hidden, basketData, page}) => {
    const navigate = useNavigate();

    const [basketLen, setBasketLen] = useState(0);
    const [colorSlider, setColorSlider] = useState('#404adf');
    const [swiperRef, setSwiperRef] = useState(null);


    let newArray = []
    basketData.map(el => {
        if (Number(el.body.tab) === page) {
            newArray = [...newArray, el]
        }
    })
    if (newArray.length !== basketLen) {
        setBasketLen(newArray.length)
    }

    let buttonMenuHeight = 40
    if (hidden) {
        buttonMenuHeight = 0
    }

    let basketKolElement = (<></>)
    if (basketLen !== null && basketLen !== 0) {
        basketKolElement = (<div className={'text-element'} style={{
            background: '#f83d3d',
            fontSize: '12px',
            height: '20px',
            width: '20px',
            borderRadius: "50%",
            textAlign: 'center',
            lineHeight: '20px',
            position: 'absolute',
            marginLeft: '27px',
            marginTop: '27px'
        }}>{basketLen}</div>)
    }

    const onIndexChange = (index) => {
        console.log(index + '--vern')
        if (window.location.pathname === '/home0' || window.location.pathname === '/home1' || window.location.pathname === '/home2') {
            if (index === 0 || index === 3) {
                setColorSlider('linear-gradient(90deg, rgba(198,65,56,1) 0%, rgba(64,74,223,1) 40%, rgba(64,74,223,1) 60%, rgba(69,217,110,1) 100%)')
                navigate('/home0')
            }
            if (index === 1 || index === 4) {
                setColorSlider('linear-gradient(90deg, rgba(64,74,223,1) 0%, rgba(64,223,112,1) 40%, rgba(69,217,110,1) 60%, rgba(198,65,56,1) 100%)')
                navigate('/home1')
            }
            if (index === 2 || index === 5) {
                setColorSlider('linear-gradient(90deg, rgba(69,217,110,1) 0%, rgba(198,65,56,1) 40%, rgba(198,65,56,1) 60%, rgba(64,74,223,1) 100%)')
                navigate('/home2')
            }
        }
    }

    return (
        <div>
            <div className={'box-grid-panel'} style={{
                position: 'absolute',
                zIndex: 120,
                background: '#171717',
                borderBottom: '2px solid #454545',
                marginTop: String(buttonMenuHeight) + 'px',
                width: String(window.innerWidth) + 'px',
                transitionProperty: 'margin',
                transitionDuration: '0.3s',
            }}>
                <Link to={'/search' + String(page)} className={'link-element'}>
                    <div className={'search'} style={{padding: '10px', display: 'flex', flexDirection: 'row'}}>
                        <div className={'background-search'} style={{width: '25px', height: '25px'}}></div>
                        <div style={{
                            height: '25px',
                            alignContent: 'center',
                            marginLeft: '3px',
                            fontSize: "16px",
                            color: 'black',
                            fontFamily: "'Montserrat', sans-serif",
                            fontVariant: 'small-caps'
                        }}>Найти игру, подписку...
                        </div>
                    </div>
                </Link>
                <Link to={'/basket' + page} className={'link-element'}>
                    <div className={'div-button-panel'} style={{padding: '3px'}}>
                        <div className={'background-basket'} style={{width: '100%', height: '100%'}}>
                            {basketKolElement}
                        </div>
                    </div>
                </Link>
                <Link to={'/info'} className={'link-element'}>
                    <div className={'div-button-panel'} style={{padding: '6px'}}>
                        <div className={'background-profile'} style={{width: '100%', height: '100%'}}></div>
                    </div>
                </Link>
            </div>

            <div className="selector-container" style={{
                height: '40px',
                overflow: 'hidden',
                transitionProperty: 'background',
                transitionDuration: '0.3s',
                border: '2px solid #454545',
                marginTop: '5px',
                justifyItems: 'center',
                background: colorSlider
            }}>
                <Swiper watchSlidesProgress={true} slidesPerView={3} className="swiper"
                        style={{
                            width: String(window.innerWidth - 14) + 'px',
                            alignContent: 'center'
                        }}
                        centeredSlides={true}
                        onActiveIndexChange={(ev) => {
                            realIndex = ev.realIndex;
                            if (!isScroll) {
                                onIndexChange(ev.realIndex)
                            }
                        }}
                        onTouchEnd={() => {
                            onIndexChange(realIndex);
                            isScroll = false
                        }}
                        onTouchStart={() => {
                            isScroll = true
                        }}
                        effect={'coverflow'}
                        onSwiper={setSwiperRef}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 0,
                            modifier: 1,
                            slideShadows: false,
                            scale: 0.7
                        }}
                        loop={true}
                        modules={[Autoplay, Pagination, Controller, EffectCoverflow]}
                        onClick={(ev) => {
                            console.log(ev.touches.currentX);
                            if (ev.touches.currentX > (window.innerWidth - 14) / 3 * 2) {
                                let nI = realIndex + 1

                                if (nI === 6) {
                                    swiperRef.slideToLoop(0, 300, false);
                                    realIndex = 0
                                } else {
                                    swiperRef.slideToLoop(realIndex + 1, 300, false);
                                    realIndex += 1
                                }
                            }
                            if (ev.touches.currentX < (window.innerWidth - 14) / 3) {
                                let nI = realIndex - 1
                                console.log(nI)
                                if (nI === -1) {
                                    swiperRef.slideToLoop(5, 300, false);
                                    realIndex = 5
                                } else {
                                    swiperRef.slideToLoop(realIndex - 1, 300, false);
                                    realIndex -= 1
                                }
                            }
                        }}
                >
                    <SwiperSlide virtualIndex={0} style={{
                        background: 'none',
                        width: String((window.innerWidth - 14) / 3) + 'px',
                        padding: '0',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        justifyItems: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                            <div className={'background-psSel'} style={{height: '20px', width: '20px'}}/>
                            <div style={{
                                textDecoration: 'none',
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: '700',
                                color: 'white',
                                fontSize: '12px',
                                marginTop: '0',
                                marginLeft:'5px'
                            }}>PLAYSTATION
                        </div>
                    </SwiperSlide>
                    <SwiperSlide virtualIndex={1} style={{
                        background: 'none',
                        alignContent: 'center',
                        width: String((window.innerWidth - 14) / 3) + 'px',
                    }}>
                        <div className={'text-element'} style={{
                            textDecoration: 'none',
                            fontFamily: "'Montserrat', sans-serif",
                            textAlign: 'center',
                            fontVariant: 'small-caps',
                            fontWeight: '700',
                            color: 'white',
                            fontSize: '19px',
                            overflow: 'hidden'
                        }}>xbox
                        </div>
                    </SwiperSlide>
                    <SwiperSlide virtualIndex={2} style={{
                        background: 'none',
                        alignContent: 'center',
                        width: String((window.innerWidth - 14) / 3) + 'px',
                    }}>
                        <div className={'text-element'} style={{
                            textDecoration: 'none',
                            fontFamily: "'Montserrat', sans-serif",
                            textAlign: 'center',
                            fontVariant: 'small-caps',
                            fontWeight: '700',
                            color: 'white',
                            fontSize: '19px',
                            overflow: 'hidden'
                        }}>сервисы
                        </div>
                    </SwiperSlide>
                    <SwiperSlide virtualIndex={3} style={{
                        background: 'none',
                        width: String((window.innerWidth - 14) / 3) + 'px',
                        padding: '0',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        justifyItems: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        <div className={'background-psSel'} style={{height: '20px', width: '20px'}}/>
                        <div style={{
                            textDecoration: 'none',
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: '700',
                            color: 'white',
                            fontSize: '12px',
                            marginTop: '0',
                            marginLeft:'5px'
                        }}>PLAYSTATION
                        </div>
                    </SwiperSlide>
                    <SwiperSlide virtualIndex={4} style={{
                        background: 'none',
                        alignContent: 'center',
                        width: String((window.innerWidth - 14) / 3) + 'px'
                    }}>
                        <div className={'text-element'} style={{
                            textDecoration: 'none',
                            fontFamily: "'Montserrat', sans-serif",
                            textAlign: 'center',
                            fontVariant: 'small-caps',
                            fontWeight: '700',
                            color: 'white',
                            fontSize: '19px',
                            overflow: 'hidden'
                        }}>xbox
                        </div>
                    </SwiperSlide>
                    <SwiperSlide virtualIndex={5} style={{
                        background: 'none',
                        alignContent: 'center',
                        width: String((window.innerWidth - 14) / 3) + 'px'
                    }}>
                        <div className={'text-element'} style={{
                            textDecoration: 'none',
                            fontFamily: "'Montserrat', sans-serif",
                            textAlign: 'center',
                            fontVariant: 'small-caps',
                            fontWeight: '700',
                            color: 'white',
                            fontSize: '19px',
                            overflow: 'hidden'
                        }}>сервисы
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>
        </div>
    );
};

export default HeadSelector;


// <SwiperSlide virtualIndex={0} style={{background:'none'}}>
//     <div onClick={()=>{swiperRef.slideTo(2, 300);console.log(2+'slide')}}>
//         <div className={'text-element'} style={{textDecoration: 'none',
//             fontFamily: "'Montserrat', sans-serif",
//             textAlign:'center',
//             height:'30px',
//             fontVariant: 'small-caps',
//             fontWeight: '700',
//             color: 'white',
//             fontSize: '16px',
//             lineHeight:'16px',
//             marginTop:'7px',
//         }}>playstation</div>
//     </div>
// </SwiperSlide>