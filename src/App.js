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
import CardProduct from "./components/UI/CardProduct";


const mainData = [{
        name: 'Новинки',
        id: 0,
        path: 'new',
        body: [
            {id: '1', title: 'Fortnite', price: 100, description: 'description-1', category: 'new', img:'https://image.api.playstation.com/vulcan/ap/rnd/202311/2801/803e41fee0edf8f8ed1de518e6eac60ddf30ac485b9a16a2.png?w=180'},
            {id: '2', title: 'Fortnite1', price: 100, description: 'description-1', category: 'new', img:'https://image.api.playstation.com/vulcan/ap/rnd/202311/2801/803e41fee0edf8f8ed1de518e6eac60ddf30ac485b9a16a2.png?w=180'},
            {id: '3', title: 'Fortnite2', price: 100, description: 'description-1', category: 'new', img:'https://image.api.playstation.com/vulcan/ap/rnd/202311/2801/803e41fee0edf8f8ed1de518e6eac60ddf30ac485b9a16a2.png?w=180'},
            {id: '4', title: 'Fortnite3', price: 100, description: 'description-1', category: 'new', img:'https://image.api.playstation.com/vulcan/ap/rnd/202311/2801/803e41fee0edf8f8ed1de518e6eac60ddf30ac485b9a16a2.png?w=180'},
            {id: '5', title: 'Fortnite4', price: 100, description: 'description-1', category: 'new', img:'https://image.api.playstation.com/vulcan/ap/rnd/202311/2801/803e41fee0edf8f8ed1de518e6eac60ddf30ac485b9a16a2.png?w=180'},
            {id: '6', title: 'UFC® 5', price: 150, description: 'description-2', category: 'new', img:'https://image.api.playstation.com/vulcan/ap/rnd/202309/0421/418704276d35ce02e8cb532c6ca3826cf866ad2ec66c0b17.png?w=180'}]
    },
    {
        name: 'Популярные',
        id: 1,
        path: 'popular',
        body: [{id: '3', title: 'Astro-Bot', price: 50, description: 'description-3', category: 'popular', img:'https://image.api.playstation.com/vulcan/ap/rnd/202406/0500/8f15268257b878597757fcc5f2c9545840867bc71fc863b1.png?w=180'},
            {id: '4', title: 'Red dead redemption 2', price: 80, description: 'description-4', category: 'popular', img:'https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA08519_00/12/i_3da1cf7c41dc7652f9b639e1680d96436773658668c7dc3930c441291095713b/i/icon0.png?w=180'}]
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
                <Route path="home" element={<Home main_data={mainData}/>}/>
                {mainData.map(category => (
                    <Route path={'home/' + category.path} key={category.id} element={<ProductList main_data={mainData[category.id].body} />}/>
                ))}
                {mainData.map(category => (
                    category.body.map(item => (
                            <Route path={'home/' + category.path + '/' + item.id} key={item.id} element={<CardProduct mainData={item} path ={category.path + '/'}/>}/>
                        ))
                ))}
                <Route path="*" element={<ErrorPage/>}/>
            </Routes>

        </div>
    );
}

export default App;
