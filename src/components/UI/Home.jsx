import React, {useEffect} from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';
import HomeBlock from "./HomeBlock";
import {useTelegram} from "../../hooks/useTelegram";


const Home = ({main_data}) => {
    const {tg} = useTelegram();

    useEffect(() => {
        tg.BackButton.show();
    }, [])
    return (
        <div>
            {main_data.map(category => (
                <HomeBlock key={category.id} path = {category.path} data={category} />
            ))}
        </div>
    );
};

export default Home;