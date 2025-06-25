import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import basket from "../icons/basket.png";
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';


import {Autoplay, Pagination, Controller, EffectCoverflow} from 'swiper/modules';


let isScroll = false
let realIndex = 0

const HeadSelector = ({hidden, pageList}) => {

    let page
    pageList.map((item, index) => {
        if('/'+item.link===window.location.pathname){
            page = index
        }
    })

    let basketData = []
    const navigate = useNavigate();

    const [basketLen, setBasketLen] = useState(0);
    const [colorSlider, setColorSlider] = useState('linear-gradient(90deg, rgba(198,65,56,1) 0%, #404ADF 50%,  rgba(69,217,110,1) 100%)');
    const [swiperRef, setSwiperRef] = useState(null);


    let newArray = []
    basketData.map(el => {
        if (Number(el.body.tab) === page && el.body.isSale === true) {
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
            fontSize: '9px',
            height: '16px',
            width: '16px',
            borderRadius: "50%",
            textAlign: 'center',
            lineHeight: '16px',
            position: 'absolute',
            marginLeft: '22px',
            marginTop: '22px'
        }}>{basketLen}</div>)
    }
    useEffect(() => {
        onIndexChange(page)
    }, [page])

    const onIndexChange = (index) => {
        let flag = false

        pageList.map((item, index) => {
            if('/'+item.link===window.location.pathname){
                flag = true
            }
        })

        if(flag){
            navigate('/' + [...pageList, ...pageList][index]["link"])
        }

        setColorSlider('linear-gradient(90deg, '+pageList[(index+2)%pageList.length].color+' 0%, '+pageList[(index+3)%pageList.length].color+' 50%, '+pageList[(index+4)%pageList.length].color+' 100%)');
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
                    <div className={'search'} style={{padding: '7px', display: 'flex', flexDirection: 'row'}}>
                        <div className={'background-search'} style={{width: '21px', height: '21px'}}></div>
                        <div style={{
                            height: '20px',
                            alignContent: 'center',
                            marginLeft: '3px',
                            fontSize: "14px",
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
                border: '0px solid white',
                marginTop: '5px',
                justifyItems: 'center',
                background: colorSlider,
                marginBottom: '2px'
            }}>
                <Swiper watchSlidesProgress={true} slidesPerView={3} className="swiper"
                        style={{
                            width: String(window.innerWidth - 14) + 'px',
                            alignContent: 'center'
                        }}
                        initialSlide={page}
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
                    {[...pageList, ...pageList].map((page, index) => (<SwiperSlide virtualIndex={index} style={{
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
                            <div style={{height: '20px', width: '20px', backgroundImage: "url('" + page.url + "')", backgroundSize:'cover'}}/>
                            <div style={{
                                textDecoration: 'none',
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: '700',
                                color: 'white',
                                fontSize: '12px',
                                marginTop: '0',
                                marginLeft: '5px'
                            }}>{page.name}
                            </div>
                        </SwiperSlide>
                    ))}
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