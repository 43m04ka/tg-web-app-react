import React from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';
import HomeBlock from "./HomeBlock";


const Home = ({main_data}) => {
    return (
        <div>
            {main_data.map(category => (
                <HomeBlock key={category.id} path = {category.path} data={category} />
            ))}
        </div>
    );
};

export default Home;