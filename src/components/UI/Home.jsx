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

    useEffect(() => {
        tg.BackButton.hide();
    }, [])

    const handleChange = (value) => {
        setPageSelected(value)
        console.log(value)
    }
    return (
        <div>
            <HeadSelector  onChange={handleChange}/>
            {main_data.map(category => (
                <HomeBlock key={category.id} path={category.path} data={category}/>
            ))}
        </div>
    );
};

export default Home;