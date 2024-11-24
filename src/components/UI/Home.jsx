import React from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";


const Home = ({main_data}) => {
    return (
        <div>
            {main_data.map(category => (
                <Link key={category.id} to={category.path}>{category.name}</Link>
            ))}
        </div>
    );
};

export default Home;