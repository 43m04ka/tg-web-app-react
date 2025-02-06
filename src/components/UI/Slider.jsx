import React, {useRef, useState} from 'react';
// Import Swiper React components
import {Swiper, SwiperSlide} from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// import required modules
import {Autoplay, Pagination, Controller, EffectCoverflow} from 'swiper/modules';
import {Link} from "react-router-dom";


const Slider = ({data}) => {

    const pagination = {
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '"></span>';
        },
    };

    let loop = false
    if (data.length > 3) {
        loop = true
    }
    return (
        <div style={{width: String(window.innerWidth) + 'px', overflowX: 'hidden'}}>
            <Swiper slidesPerView={3} className="swiper"
                    style={{width: String(window.innerWidth + 220) + 'px', marginLeft: '-110px'}}
                    spaceBetween={0}
                    centeredSlides={true}
                    effect={'coverflow'}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 10,
                        depth: 300,
                        modifier: 0.1,
                        slideShadows: false,
                        scale: 0.83
                    }}
                    autoplay={{
                        delay: 7000,
                        disableOnInteraction: false,
                    }}
                    pagination={pagination}
                    loop={loop}
                    modules={[Autoplay, Pagination, Controller, EffectCoverflow]}
            >
                {data.map(el => {
                    return (<SwiperSlide key={el.id} style={{border:'1px solid blue'}}>
                        <div style={{border: '1px solid red', zIndex:'50'}}>
                            <Link to={el.path} className={'link-element'}
                                  style={{justifyContent: 'left', marginLeft: '0px', marginRight: '0', border:'1px solid green'}}>
                                <div style={{
                                    width: String((window.innerWidth + 200) / 3) + 'px',
                                    height:String((window.innerWidth + 200) / 3 * 800 / 560) + 'px',
                                    marginBottom: '15px',
                                    marginLeft: '0',
                                    justifyContent: 'left',
                                    marginRight: '0',
                                    backgroundImage: "url('" + el.url + "')",
                                    backgroundSize:'cover',
                                    borderRadius:'10px',
                                }}/>
                            </Link>
                        </div>
                    </SwiperSlide>)
                })}
            </Swiper>
        </div>
    );
};

export default Slider;
