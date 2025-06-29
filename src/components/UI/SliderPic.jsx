import React, {useEffect, useState} from 'react';

import {Swiper, SwiperSlide} from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import {Autoplay, Pagination, Controller, EffectCoverflow} from 'swiper/modules';
import {useNavigate} from "react-router-dom";
import {useServer} from "../../hooks/useServer";

let realIndex = 0
let lastPageID = -1
const Slider = ({pageId}) => {
    const {getCatalogs} = useServer()
    const [data, setData] = useState([]);

    if(lastPageID !== pageId){
        lastPageID = pageId;
        getCatalogs(pageId, 'head', setData).then()
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

    useEffect(() => {
        getCatalogs(pageId, 'head', setData)
    }, []);

    if(data.length > 0){
    return (
        <div style={{width: String(window.innerWidth) + 'px', overflowX: 'hidden', marginBottom:'20px'}}>
            <Swiper slidesPerView={3} className="swiper"
                    style={{width: String(window.innerWidth * 0.5 * 3 + 14) + 'px', marginLeft: '-'+String((window.innerWidth * 0.5 * 3 + 14 - window.innerWidth)/2)+'px'}}
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
                        if (ev.touches.currentX > window.innerWidth * 0.75) {
                            if(realIndex !== data.length-1) {
                                console.log(realIndex + 1)
                                navigate(data[realIndex+1].path)
                            }else{
                                navigate(data[0].path)
                            }
                        }
                        else if (ev.touches.currentX < window.innerWidth * 0.25) {
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
                    return (<SwiperSlide key={el.id}>
                        <div style={{zIndex:'50'}}>
                                <div style={{
                                    width: String(window.innerWidth * 0.5) + 'px',
                                    height:String(window.innerWidth * 0.5 * 800 / 560) + 'px',
                                    marginBottom: '20px',
                                    marginLeft: '0',
                                    justifyContent: 'left',
                                    marginRight: '0',
                                    backgroundImage: "url('" + el.url + "')",
                                    backgroundSize:'cover',
                                    borderRadius:'10px',
                                }}/>
                        </div>
                    </SwiperSlide>)
                })}
            </Swiper>
        </div>
    );}
    else{
        return(
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{width:String(window.innerWidth/4-10) + 'px', height:String(window.innerWidth*2/3) + 'px', background:'#373737', borderRadius:'0 10px 10px 0'}}/>
                <div style={{width:String(window.innerWidth/2-10) + 'px', height:String(window.innerWidth*2/3+65) + 'px', background:'#373737', borderRadius:'10px'}}/>
                <div style={{width:String(window.innerWidth/4-10) + 'px', height:String(window.innerWidth*2/3) + 'px', background:'#373737', borderRadius:'10px 0 0 10px'}}/>
            </div>
        )
    }
};

export default Slider;
