//import logo from './logo.svg';
import './App.css';
import React, {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import Header from "./components/UI/Header";
import {Route, Routes} from "react-router-dom";
import ProductList from "./components/UI/ProductList";
import Home from "./components/UI/Home";
import ErrorPage from "./components/UI/ErrorPage";
import ProductItem from "./components/UI/ProductItem";


const main_data = [{
        name: 'new',
        id: 0,
        path: 'new',
        body: [
            {id: '1', title: 'title-1', price: 100, description: 'description-1', category: 'new'},
            {id: '2', title: 'title-2', price: 150, description: 'description-2', category: 'new'}]
    },
    {
        name: 'sale',
        id: 1,
        path: 'sale',
        body: [{id: '3', title: 'title-3', price: 50, description: 'description-3', category: 'sale'},
            {id: '4', title: 'title-4', price: 80, description: 'description-4', category: 'sale'}]
    }
]

function App() {

    const {tg} = useTelegram()


    useEffect(() => {
        tg.ready();
    }, [])

    return (
        <div className="App">
            <Header/>
            <Routes>
                <Route path="home" element={<Home main_data={main_data}/>}/>
                {main_data.map(category => (
                    <Route path={'home/' + category.path} key={category.id} element={<ProductList main_data={main_data[category.id].body} />}/>
                ))}
                <Route path="*" element={<ErrorPage/>}/>
            </Routes>

        </div>
    );
}

export default App;
