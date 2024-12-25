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

const data = [
    {
        "id": 1,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "1 месяц",
        "price": 990,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://i.postimg.cc/L8mzwXbq/PS.png"
    },
    {
        "id": 2,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "3 месяца",
        "price": 1490,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://i.postimg.cc/qBCXCWK7/PS-1.png"
    },
    {
        "id": 3,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "12 месяцев",
        "price": 4990,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://i.postimg.cc/WbLmmSmw/PS-2.png"
    }
    ,
    {
        "id": 4,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "12 месяцев",
        "price": 4990,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://i.postimg.cc/RV77gfX5/PS-3.png"
    }
]


const Slider = () => {
    const [swiperElement, setSwiperElement] = useState(null);

    return (
        <div>
            <Swiper watchSlidesProgress={true} slidesPerView={3} className="swiper"
                    style={{width: String(window.innerWidth) + 'px'}}
                    spaceBetween={30}
                    centeredSlides={true}
                    onSlideChange={(event) => {if(event.realIndex !== swiperElement){setSwiperElement(event.realIndex)}}}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: false,
                    }}
                    loop={() => {if(data.length > 3){return true}else{return false}}}
                    modules={[Autoplay, Pagination, Controller]}
                    style={{justifyItems:'center'}}
            >
                {data.map(el => {
                    var height1 = 0
                    var margin1 = 0
                    if(swiperElement === el.id-1){
                        console.log('big', el.id)
                        height1 = 170
                    }else{
                        console.log('small')
                        height1 = 150
                        margin1 = 10
                    }

                    console.log(height1)
                    return (<SwiperSlide key={el.id}>
                        <div style={{width:String(170)+'px', paddingTop:String(margin1)+'px'}}>
                        <ElementSlider number={swiperElement} img={el.img} height={height1} id={el.id}/>
                        </div>
                    </SwiperSlide>)
                })}
            </Swiper>
        </div>
    );
};

export default Slider;
