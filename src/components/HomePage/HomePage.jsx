import React from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import Header from "./components/Header/Header";
import {Route, Routes} from "react-router-dom";
import ProductList from "../ProductList/ProductList";
import Form from "../Form/Form";

const groups = [
    {id:1},
    {id:2},
    {id:3},
    {id:4},
]
const HomePage = () => {
    const {tg} = useTelegram();

    return (
        <div className={'home-page'}>
            <Header />
            <Routes>
                {groups.map(group => (
                    <Route index element={<ProductList id = {group.id}/>}/>
                ))}
                <Route path={'form'} element={<Form/>}/>
            </Routes>
        </div>
    );
};

export default HomePage;