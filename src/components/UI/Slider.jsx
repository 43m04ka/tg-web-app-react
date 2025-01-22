import React, {useRef, useState} from 'react';
// Import Swiper React components
import {Swiper, SwiperSlide} from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// import required modules
import {Autoplay, Pagination,  Controller, EffectCoverflow} from 'swiper/modules';
import ElementSlider from "./ElementSlider";
import {Link} from "react-router-dom";


const Slider = ({data}) => {
    const [swiperElement, setSwiperElement] = useState(null);

    const pagination = {
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '"></span>';
        },
    };

    let loop = false
    if(data.length > 3){loop = true}
    return (
        <div style={{width:String(window.innerWidth)+'px', overflowX:'hidden'}}>
            <Swiper watchSlidesProgress={true} slidesPerView={3} className="swiper"
                    style={{width: String(window.innerWidth+200) + 'px',justifyItems:'center', marginLeft:'-100px'}}
                    spaceBetween={30}
                    centeredSlides={true}
                    effect={'coverflow'}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 400,
                        modifier: 0.1,
                        slideShadows: false,
                        scale:0.83
                    }}
                    onSlideChange={(event) => {if(event.realIndex !== swiperElement){setSwiperElement(event.realIndex)}}}
                    autoplay={{
                        delay: 7000,
                        disableOnInteraction: false,
                    }}
                    pagination={pagination}
                    loop={loop}
                    modules={[Autoplay, Pagination, Controller, EffectCoverflow]}
            >
                {data.map(el => {
                    return (<SwiperSlide key={el.id}>
                        <div>
                            <Link to={el.path} className={'link-element'}>
                                <img src={el.url} id={'box'} alt={''} style={{width:String((window.innerWidth+150)/3) + 'px',  marginBottom:'15px', marginLeft:'0'}}/>
                            </Link>
                        </div>
                    </SwiperSlide>)
                })}
            </Swiper>
        </div>
    );
};

export default Slider;
