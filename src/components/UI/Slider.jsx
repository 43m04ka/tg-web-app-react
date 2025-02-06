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
import {Link, useNavigate} from "react-router-dom";

let realIndex = 0
const Slider = ({data}) => {

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
    return (
        <div style={{width: String(window.innerWidth) + 'px', overflowX: 'hidden'}}>
            <div className={'text-element'}>{number}</div>
            <Swiper slidesPerView={3} className="swiper"
                    style={{width: String(window.innerWidth + 220) + 'px', marginLeft: '-110px'}}
                    spaceBetween={0}
                    centeredSlides={true}
                    effect={'coverflow'}
                    onActiveIndexChange={(ev) => {
                        onIndexChange(ev.realIndex)
                    }}
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
                    onClick={(ev) => {
                        setNumber(ev.touches.currentX)
                        if (ev.touches.currentX > (window.innerWidth - 14) / 3 * 2) {
                            if(realIndex !== data.length-1) {
                                console.log(realIndex + 1)
                                navigate(data[realIndex+1].path)
                            }else{
                                navigate(data[0].path)
                            }
                        }
                        else if (ev.touches.currentX < (window.innerWidth - 14) / 3) {
                            if(realIndex !== 0) {
                                navigate(data[realIndex-1].path)
                            }else{
                                navigate(data[data.length -1].path)
                            }
                        }else{
                            navigate(data[realIndex].path)
                        }
                    }}
            >
                {data.map(el => {
                    return (<SwiperSlide key={el.id} style={{border:'1px solid blue'}}>
                        <div style={{border: '1px solid red', zIndex:'50'}}>
                            {/*<Link to={el.path} className={'link-element'}*/}
                            {/*      style={{justifyContent: 'left', marginLeft: '0px', marginRight: '0', border:'1px solid green'}}>*/}
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
                            {/*</Link>*/}
                        </div>
                    </SwiperSlide>)
                })}
            </Swiper>
        </div>
    );
};

export default Slider;
