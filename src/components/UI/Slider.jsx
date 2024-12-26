import React, {useRef, useState} from 'react';
// Import Swiper React components
import {Swiper, SwiperSlide} from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// import required modules
import {Autoplay, Pagination, Navigation, Controller} from 'swiper/modules';
import ElementSlider from "./ElementSlider";
import {Link} from "react-router-dom";


const Slider = ({data}) => {
    const [swiperElement, setSwiperElement] = useState(null);
    console.log(data)
    return (
        <div style={{height:String(window.innerWidth/3*1.4)+'px'}}>
            <Swiper watchSlidesProgress={true} slidesPerView={3} className="swiper"
                    style={{width: String(window.innerWidth) + 'px'}}
                    spaceBetween={30}
                    centeredSlides={true}
                    onSlideChange={(event) => {if(event.realIndex !== swiperElement){setSwiperElement(event.realIndex)}}}
                    autoplay={{
                        delay: 7000,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: false,
                    }}
                    loop={false}
                    modules={[Autoplay, Pagination, Controller]}
                    style={{justifyItems:'center'}}
            >
                {data.map(el => {
                    var height1 = 0
                    var margin1 = 0
                    if(swiperElement === el.id-1){
                        console.log('big', el.id)
                        height1 = (window.innerWidth-30)/3
                    }else{
                        console.log('small')
                        height1 = (window.innerWidth-70)/3
                        margin1 = 10
                    }

                    console.log(height1)
                    return (<SwiperSlide key={el.id}>
                        <div style={{width:String((window.innerWidth-30)/3)+'px', paddingTop:String(margin1)+'px'}}>
                            <Link to={el.path} className={'link-element'}>
                                <ElementSlider number={swiperElement} img={el.img} height={height1} id={el.id}/>
                            </Link>
                        </div>
                    </SwiperSlide>)
                })}
            </Swiper>
        </div>
    );
};

export default Slider;
