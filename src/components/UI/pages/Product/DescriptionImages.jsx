import React, {useEffect} from 'react';
import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination} from "swiper/modules";
import style from './Product.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";

const DescriptionImages = ({data}) => {

    const {tg} = useTelegram()
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = React.useState(null);
    const onBack = () => {
        return selectedId === null ? navigate(-1) : setSelectedId(null)
    }

    useEffect(() => {
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => onBack());
        return () => {
            tg.offEvent('backButtonClicked', () => onBack())
        }
    }, [])

    return (<div style={{width:'100vw', minHeight: '45vw', overflowX:'hidden'}}>
        <Swiper
            slidesPerView={3}
            centeredSlides={true}
            spaceBetween={0}
            style={{marginLeft: '-60vw', width: '220vw'}}
            loop={data.length > 3}
        >
            {data.map((el, index) => (<SwiperSlide key={index} className={style['slide']}>
                <img src={el} className={style['descriptionImage']} onClick={() => {
                    setSelectedId(index)
                }}/>
            </SwiperSlide>))}
        </Swiper>
        {selectedId !== null ? <div onClick={(event) => {
            setSelectedId(null)
        }} className={style['bigSlide']}>
            <img src={data[selectedId]} className={style['descriptionImageOpen']}/>
        </div> : ''}

    </div>);
};

export default DescriptionImages;