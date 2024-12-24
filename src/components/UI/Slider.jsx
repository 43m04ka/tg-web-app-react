import React, {useRef, useState} from 'react';
// Import Swiper React components
import {Swiper, SwiperSlide} from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// import required modules
import {Autoplay, Pagination, Navigation} from 'swiper/modules';
import ElementSlider from "./ElementSlider";

const data = [
    {
        "id": 1,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "1 месяц",
        "price": 990,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://optim.tildacdn.com/stor6561-3939-4638-b861-323036656633/-/format/webp/28666960.png"
    },
    {
        "id": 2,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "3 месяца",
        "price": 1490,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://optim.tildacdn.com/stor3535-6337-4335-b264-303363386136/-/format/webp/66819490.png"
    },
    {
        "id": 3,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "12 месяцев",
        "price": 4990,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://optim.tildacdn.com/stor6339-3363-4135-a164-646137326235/-/format/webp/54391243.png"
    }
    ,
    {
        "id": 4,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "12 месяцев",
        "price": 4990,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://optim.tildacdn.com/stor6339-3363-4135-a164-646137326235/-/format/webp/54391243.png"
    }
    ,
    {
        "id": 5,
        "title": "PS Plus Essential",
        "platfrom": "PS4, PS5",
        "wiew": "12 месяцев",
        "price": 4990,
        "description": "PS Plus Essential — даёт доступ к онлайну в играх (Которые у Вас на дисках или куплены на аккаунт) и 3 бесплатные игры каждый месяц",
        "img": "https://optim.tildacdn.com/stor6339-3363-4135-a164-646137326235/-/format/webp/54391243.png"
    }
]


const Slider = () => {
    return (
        <div>
            <Swiper watchSlidesProgress={true} slidesPerView={3} className="swiper"
                    style={{width: String(window.innerWidth) + 'px'}}
                    spaceBetween={30}
                    centeredSlides={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: false,
                    }}
                    loop={true}
                    modules={[Autoplay, Pagination]}
            >
                {data.map(el => (
                    <SwiperSlide key={el.id}>
                        <ElementSlider img = {el.img}/>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Slider;
