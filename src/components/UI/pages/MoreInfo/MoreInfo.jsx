import {Autoplay, Controller, EffectCoverflow, Pagination} from "swiper/modules";

const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

import React, {useCallback, useEffect, useState} from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import style from './MoreInfo.module.scss'
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css/pagination';

const clueList = [{name: 'пользовательское соглашение'},
    {name: 'политика конфиндециальности'},
    {name: 'группа вк со скидками для playstation'},
    {name: 'tg канал со скидками для xbox'},
    {name: 'группа вк со скидками для xbox'},
    {name: 'tg канал со скидками для playstation'},
    {name: 'faq для playstation'},
    {name: 'faq для xbox'},
    {name: 'написать в поддержку'},
]

const MoreInfo = () => {
    const {tg} = useTelegram();
    const navigate = useNavigate();
    const [info, setInfo] = useState([]);

    const pagination = {
        clickable: true, renderBullet: function (index, className) {
            return '<span class="' + className + '"></span>';
        },
    };

    const onBack = useCallback(() => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.BackButton.show();
        fetch(`${URL}/getInfoBlock?time${new Date()}`, {
            method: 'GET', headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setInfo(data.result)
            })
        })
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    return (<div className={style['container']}
                 style={{paddingBottom: String(window.innerWidth * 0.20 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom + (window.screen.availHeight - window.innerHeight - (window.screen.availHeight - window.innerHeight > 0) ? window.innerWidth * 0.20 : 0) + 10) + 'px'}}>
        >
        <div>
            <div>
                <div>
                    <div/>
                    <p>Мои</p>
                    <p>покупки</p>
                </div>
                <div>
                    <div/>
                    <p>Избранное</p>
                </div>
            </div>
            <div>
                <div>
                    <div/>
                    <p>Мой</p>
                    <p>кэшбек</p>
                </div>
                <div>
                    <div/>
                    <p>Поддержка</p>
                </div>
            </div>
        </div>

        <div>Акции и спецпредложения</div>

        <div style={{width: '100vw', overflow: 'hidden', height: '46vw'}}>
            <Swiper slidesPerView={2} pagination={pagination} style={{width: '105vw', marginLeft: '-2.5vw'}}
                    modules={[Pagination]} spaceBetween={0}>
                {info.map((item, index) => (<SwiperSlide key={index}>
                    <div className={style['slide']} style={{
                        webkitAnimationDelay: String(0.1 * index) + 's',
                        animationDelay: String(0.1 * index + 0.2) + 's',}}>
                        <div>{item.name}</div>
                        <div>{item.body}</div>
                    </div>
                </SwiperSlide>))}
                <SwiperSlide>

                </SwiperSlide>
            </Swiper>
        </div>

        <div className={style['homeScreen']}>
            <div>
                {clueList.map((item, index) => {
                    return (<div className={style['animClue']} style={{
                        background: (index === clueList.length - 1 ? '#489a4e' : '#373737')
                    }} onClick={() => {
                        setInputValue(item.name)
                    }}>{item.name}</div>)
                })}
            </div>
        </div>
    </div>);
};

export default MoreInfo;