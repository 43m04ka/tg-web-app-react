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
    const [swiperElement, setSwiperElement] = useState(null);

    return (
        <div>
            <Swiper watchSlidesProgress={true} slidesPerView={3} className="swiper"
                    style={{width: String(window.innerWidth) + 'px'}}
                    spaceBetween={30}
                    onClick={() => console.log(swiperRef)}
                    centeredSlides={true}
                    onSlideChange={(event) => {setSwiperElement(event.realIndex)}}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: false,
                    }}
                    loop={true}
                    modules={[Autoplay, Pagination, Controller]}
                    style={{justifyItems:'center'}}
            >
                {data.map(el => {
                    var height1 = 0
                    if(swiperElement === el.id-1){
                        console.log('big', el.id)
                        height1 = (window.innerWidth)/3
                    }else{
                        console.log('small')
                        height1 = (window.innerWidth-35)/3
                    }

                    console.log(height1)
                    return (<SwiperSlide key={el.id}>
                        <div style={{width:String((window.innerWidth)/3)+'px'}}>
                        <ElementSlider number={swiperElement} img={el.img} height={height1} id={el.id}/>
                        </div>
                    </SwiperSlide>)
                })}
            </Swiper>
        </div>
    );
};

export default Slider;
