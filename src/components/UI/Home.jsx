import React, {useEffect, useState} from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';
import HomeBlock from "./HomeBlock";
import {useTelegram} from "../../hooks/useTelegram";
import HeadSelector from "./HeadSelector";


const Home = ({main_data}) => {
    const {tg} = useTelegram();
    const [pageSelected, setPageSelected] = useState(0);
    const [data, setData] = useState(main_data[0])

    useEffect(() => {
        tg.BackButton.hide();
    }, [])

    const handleChange = (value) => {
        setPageSelected(value)
        if(value===0){
            setData(main_data[0])
        }else if(value===1){
            setData(main_data[1])
        }
    }
    return (
        <div>
            <HeadSelector  onChange={handleChange}/>
            {data.body.map(category => (
                <HomeBlock key={category.id} path={category.path} data={category}/>
            ))}
        </div>
    );
};

export default Home;