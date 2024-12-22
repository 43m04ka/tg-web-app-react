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
    },
    {
        "id": 4,
        "title": "PS Plus Extra",
        "platfrom": "PS4, PS5",
        "wiew": "1 месяц",
        "price": 1790,
        "description": "PS Plus Extra — всё из Essential и каталог из 400+ бесплатных игр.",
        "img": "https://optim.tildacdn.com/stor3739-3263-4239-a238-393335646365/-/format/webp/86600064.png"
    },
    {
        "id": 5,
        "title": "PS Plus Extra",
        "platfrom": "PS4, PS5",
        "wiew": "3 месяца",
        "price": 2990,
        "description": "PS Plus Extra — всё из Essential и каталог из 400+ бесплатных игр.",
        "img": "https://optim.tildacdn.com/stor6236-3461-4237-b231-303238373538/-/format/webp/61030755.png"
    },
    {
        "id": 6,
        "title": "PS Plus Extra",
        "platfrom": "PS4, PS5",
        "wiew": "12 месяцев",
        "price": 8490,
        "description": "PS Plus Extra — всё из Essential и каталог из 400+ бесплатных игр.",
        "img": "https://optim.tildacdn.com/stor6463-6532-4261-b033-646164376533/-/format/webp/80017909.png"
    },
    {
        "id": 7,
        "title": "PS Plus Deluxe",
        "platfrom": "PS4, PS5",
        "wiew": "1 месяц",
        "price": 1990,
        "description": "PS Plus Deluxe — всё из Essential и Extra, а ещё каталог из 200+ бесплатных ретро-игр и демоверсии некоторых игр.",
        "img": "https://optim.tildacdn.com/stor3164-3138-4238-b462-333539326139/-/format/webp/52206013.png"
    },
    {
        "id": 8,
        "title": "PS Plus Deluxe",
        "platfrom": "PS4, PS5",
        "wiew": "3 месяца",
        "price": 3490,
        "description": "PS Plus Deluxe — всё из Essential и Extra, а ещё каталог из 200+ бесплатных ретро-игр и демоверсии некоторых игр.",
        "img": "https://optim.tildacdn.com/stor3664-6238-4530-a634-306333306538/-/format/webp/51197197.png"
    },
    {
        "id": 9,
        "title": "PS Plus Deluxe",
        "platfrom": "PS4, PS5",
        "wiew": "12 месяцев",
        "price": 9990,
        "description": "PS Plus Deluxe — всё из Essential и Extra, а ещё каталог из 200+ бесплатных ретро-игр и демоверсии некоторых игр.",
        "img": "https://optim.tildacdn.com/stor6535-3337-4530-b835-386438646331/-/format/webp/64176432.png"
    },
    {
        "id": 10,
        "title": "EA Play",
        "platfrom": "PS4, PS5",
        "wiew": "1 месяц",
        "price": 1190,
        "description": "EA Play — нет доступа к онлайн режиму без PS Plus Essential, открывает каталог из 45+ бесплатных игр от Electronic Arts (В том числе NHL23, UFC4, Battlefield 2042 и многие другие топовые игры от издателя EA).",
        "img": "https://optim.tildacdn.com/stor6335-3630-4064-b331-336365653038/-/format/webp/90601560.png"
    },
    {
        "id": 11,
        "title": "EA Play",
        "platfrom": "PS4, PS5",
        "wiew": "3 месяца",
        "price": 3300,
        "description": "EA Play — нет доступа к онлайн режиму без PS Plus Essential, открывает каталог из 45+ бесплатных игр от Electronic Arts (В том числе NHL23, UFC4, Battlefield 2042 и многие другие топовые игры от издателя EA).",
        "img": "https://optim.tildacdn.com/stor6638-3638-4430-a137-356361633130/-/format/webp/32092967.png"
    },
    {
        "id": 12,
        "title": "EA Play",
        "platfrom": "PS4, PS5",
        "wiew": "12 месяцев",
        "price": 5990,
        "description": "EA Play — нет доступа к онлайн режиму без PS Plus Essential, открывает каталог из 45+ бесплатных игр от Electronic Arts (В том числе NHL23, UFC4, Battlefield 2042 и многие другие топовые игры от издателя EA).",
        "img": "https://optim.tildacdn.com/stor3663-3461-4533-a166-366366386239/-/format/webp/60794844.png"
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
                    modules={[Autoplay, Pagination]}
            >
                {data.map(el => (
                    <SwiperSlide key={el.id}>
                        <img src={el.img} alt="" style={{borderRadius:'10px',height: String(window.innerWidth / 3) + 'px'}}/>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Slider;
