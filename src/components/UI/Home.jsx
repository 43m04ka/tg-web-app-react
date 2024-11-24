import React from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';


const Home = ({main_data}) => {
    return (
        <div>
            {main_data.map(category => (
                <Link key={category.id} to={category.path}>
                    <div className={'div-rect'}>{'Category'+category.id + '--' + category.name}</div>
                </Link>
            ))}
        </div>
    );
};

export default Home;