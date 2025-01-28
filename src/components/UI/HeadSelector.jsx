import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import basket from "../icons/basket.png";
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';


import {Autoplay, Pagination,  Controller, EffectCoverflow} from 'swiper/modules';

const HeadSelector = ({hidden, basketData, page}) => {
    const navigate = useNavigate();

    const [pageSelected, setPageSelected] = useState(page);
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

    const onIndexChange = (index) =>{
        console.log('-----------------------')
        console.log(index+'tek')
        if(index===0 || index===3){
            setColorSlider('#404adf')
            navigate('/home0')
        }if(index===1 || index===4){
            setColorSlider('#40df70')
            navigate('/home1')
        }if(index===2 || index===5){
            setColorSlider('#c64138')
            navigate('/home2')
        }
    }

    const slideTo = (index) => {
        swiperRef.slideTo(index - 1, 0);
    };

    return (
        <div>
            <div className={'box-grid-panel'} style={{
                position: 'absolute',
                zIndex: 120,
                background: '#171717',
                borderBottom: '2px solid #454545',
                marginTop: String(buttonMenuHeight) + 'px',
                width:String(window.innerWidth) + 'px',
                transitionProperty:'margin',
                transitionDuration: '0.3s',
            }}>
                <Link to={'/search' + String(pageSelected)} className={'link-element'}>
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
                border:'2px solid #454545',
                marginTop:'5px',
                justifyItems:'center',
                background:colorSlider
            }}>
                <Swiper watchSlidesProgress={true} slidesPerView={3} className="swiper"
                        style={{width: String(window.innerWidth-20) + 'px',alignContent:'center'}}
                        centeredSlides={true}
                        onRealIndexChange={(event)=>{onIndexChange(event.realIndex)}}
                        effect={'coverflow'}
                        onSwiper={setSwiperRef}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 0,
                            modifier: 1,
                            slideShadows: false,
                            scale:0.7
                        }}
                        loop={true}
                        modules={[Autoplay, Pagination, Controller, EffectCoverflow]}
                >
                    <SwiperSlide virtualIndex={0} style={{background:'none', border:'2px solid red', alignContent:'center'}}>
                                <div className={'text-element'} style={{textDecoration: 'none',
                                    fontFamily: "'Montserrat', sans-serif",
                                    textAlign:'center',
                                    fontVariant: 'small-caps',
                                    fontWeight: '700',
                                    color: 'white',
                                    fontSize: '19px',
                                    overflow:'hidden'
                                }}>playstation</div>
                    </SwiperSlide>
                    <SwiperSlide virtualIndex={1}  style={{background:'none', alignContent:'center'}}>
                                <div className={'text-element'} style={{textDecoration: 'none',
                                    fontFamily: "'Montserrat', sans-serif",
                                    textAlign:'center',
                                    fontVariant: 'small-caps',
                                    fontWeight: '700',
                                    color: 'white',
                                    fontSize: '19px',
                                    overflow:'hidden'
                                }}>xbox</div>
                    </SwiperSlide>
                    <SwiperSlide  virtualIndex={2} style={{background:'none', alignContent:'center'}}>
                                <div className={'text-element'} style={{textDecoration: 'none',
                                    fontFamily: "'Montserrat', sans-serif",
                                    textAlign:'center',
                                    fontVariant: 'small-caps',
                                    fontWeight: '700',
                                    color: 'white',
                                    fontSize: '19px',
                                    overflow:'hidden'
                                }}>сервисы</div>
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