import React, {useEffect, useState} from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';
import HomeBlock from "./HomeBlock";
import {useTelegram} from "../../hooks/useTelegram";
import HeadSelector from "./HeadSelector";
import Slider from "./Slider";

const Home = ({main_data, height, width}) => {
    const {tg} = useTelegram();
    const [pageSelected, setPageSelected] = useState(0);
    const [data, setData] = useState(main_data[0])

    useEffect(() => {
        tg.BackButton.hide();
    }, [])

    const handleChange = (value) => {
        setPageSelected(value)
        if (value === 0) {
            setData(main_data[0])
        } else if (value === 1) {
            setData(main_data[1])
        }
    }

    return (
        <div>

            <HeadSelector onChange={handleChange} main_data={main_data}/>

            <div className={'scroll-container-y'}
                 style={{height: String(height - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top - 120) + 'px'}}>
                <div style={{width: String(window.innerWidth) + 'px'}}>
                    <Slider data={data.body[0]}/>
                </div>
                {data.body[1].map(category => (
                    <HomeBlock key={category.id} path={category.path} data={category}/>
                ))}
            </div>
        </div>
    )
        ;
};

export default Home;