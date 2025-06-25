import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import Slider from "react-slick";

let isScroll = false
let realIndex = 0
let isPage = false

const HeadSelector = ({hidden, page}) => {
    let basketData = []

    const navigate = useNavigate();

    const [basketLen, setBasketLen] = useState(0);
    const [colorSlider, setColorSlider] = useState('linear-gradient(90deg, rgba(198,65,56,1) 0%, rgba(64,74,223,1) 40%, rgba(64,74,223,1) 60%, rgba(69,217,110,1) 100%)');
    const [swiperRef, setSwiperRef] = useState(null);

    let settings = {
        style:{height:'40px'},
        swipeToSlide: true,
        infinite: true,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 0,
        centerMode: true,
        button:false
    };

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
        if (window.location.pathname === '/home0' || window.location.pathname === '/home1' || window.location.pathname === '/home2' || window.location.pathname === '/home0/' || window.location.pathname === '/home1/' || window.location.pathname === '/home2/') {
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
                <div style={{border:'2px solid red', height: '40px', width: String(window.innerWidth-14) + 'px'}}>
                    <Slider {...settings}>
                        <div className={'selector-text'}>PLAYSTATION
                        </div>
                        <div className={'selector-text'}>XBOX
                        </div>
                        <div className={'selector-text'}>СЕРВИСЫ
                        </div>
                    </Slider>
                </div>
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

// if (ev.touches.currentX > (window.innerWidth - 14) / 3 * 2) {
//     let nI = realIndex + 1
//
//     if (nI === 6) {
//         swiperRef.slideToLoop(0, 300, false);
//         realIndex = 0
//     } else {
//         swiperRef.slideToLoop(realIndex + 1, 300, false);
//         realIndex += 1
//     }
// }
// if (ev.touches.currentX < (window.innerWidth - 14) / 3) {
//     let nI = realIndex - 1
//     if (nI === -1) {
//         swiperRef.slideToLoop(5, 300, false);
//         realIndex = 5
//     } else {
//         swiperRef.slideToLoop(realIndex - 1, 300, false);
//         realIndex -= 1
//     }
// }