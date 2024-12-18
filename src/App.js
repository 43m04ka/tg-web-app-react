//import logo from './logo.svg';
import './App.css';
import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes} from "react-router-dom";
import ProductList from "./components/UI/ProductList";
import Home from "./components/UI/Home";
import ErrorPage from "./components/UI/ErrorPage";
import ProductItem from "./components/UI/ProductItem";
import CardProduct from "./components/UI/CardProduct";
import Basket from "./components/UI/Basket";


const mainData = [
    {
        id: 0, page: 'playstation', body: [
            {
                id: 0,
                name: 'Новинки',
                path: 'new',
                body: [
                    {
                        id: '0',
                        title: 'Far Cry 5',
                        price: 180,
                        description: 'description-1',
                        img: 'https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA05847_00/2/i_156be5fdc23a961f0e2b05974c0df5ecfd6169b09aa25e5c510ec7e6e1ad683f/i/icon0.png'
                    },
                    {
                        id: '1',
                        title: 'DOOM Eternal Standard Edition',
                        price: 165,
                        description: 'description-1',
                        img: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0114/ERNPc4gFqeRDG1tYQIfOKQtM.png'
                    },
                    {
                        id: '2',
                        title: 'Divinity: Original Sin 2 - Definitive Edition',
                        price: 100,
                        description: 'description-1',
                        img: 'https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA11898_00/7/i_54c96b482f927d0516249edbc804fa5c99a351443544964e3335bd12869db9c7/i/icon0.png'
                    },
                    {
                        id: '3',
                        title: 'NieR: Automata™ Game of the YoRHa Edition',
                        price: 100,
                        description: 'description-1',
                        img: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0604/gwDCkbeX5axMIavw9XrDvihp.png'
                    },
                    {
                        id: '4',
                        title: 'UFC® 5',
                        price: 150,
                        description: 'description-2',
                        img: 'https://image.api.playstation.com/vulcan/ap/rnd/202309/0421/418704276d35ce02e8cb532c6ca3826cf866ad2ec66c0b17.png?w=180'
                    }]
            }, {
                id: 1,
                name: 'Популярные',
                path: 'popular',
                body:  [
                    {
                        id: '6',
                        title: 'Astro-Bot',
                        price: 50,
                        description: 'description-3',
                        img: 'https://image.api.playstation.com/vulcan/ap/rnd/202406/0500/8f15268257b878597757fcc5f2c9545840867bc71fc863b1.png?w=180'
                    },
                    {
                        id: '7',
                        title: 'Red dead redemption 2',
                        price: 80,
                        description: 'description-4',
                        img: 'https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA08519_00/12/i_3da1cf7c41dc7652f9b639e1680d96436773658668c7dc3930c441291095713b/i/icon0.png?w=180'
                    },
                    {
                        id: '8',
                        title: 'Divinity: Original Sin 2 - Definitive Edition',
                        price: 100,
                        description: 'description-1',
                        img: 'https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA11898_00/7/i_54c96b482f927d0516249edbc804fa5c99a351443544964e3335bd12869db9c7/i/icon0.png'
                    },
                    {
                        id: '9',
                        title: 'NieR: Automata™ Game of the YoRHa Edition',
                        price: 100,
                        description: 'description-1',
                        img: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0604/gwDCkbeX5axMIavw9XrDvihp.png'
                    },
                    {
                        id: '10',
                        title: 'UFC® 5',
                        price: 150,
                        description: 'description-2',
                        img: 'https://image.api.playstation.com/vulcan/ap/rnd/202309/0421/418704276d35ce02e8cb532c6ca3826cf866ad2ec66c0b17.png?w=180'
                    }]
            }
        ]
    },
    {
        id: 1, page: 'xbox', body: []
    }]


function App() {
    const {tg} = useTelegram();
    const [margin, setMargin] = useState(0)

    const setTargetMargin = (() =>{
        setMargin(70)
    })

    useEffect(() => {
        tg.disableVerticalSwipes();
        try {
            tg.requestFullscreen()
        }catch (err) {console.log(err)}
        tg.ready();
        tg.onEvent('fullscreenChanged', setTargetMargin)
    }, [setTargetMargin])

    return (
        <div className="App">
            <div style={{marginTop:String(margin)+'px'}}></div>
            <Routes>
                <Route path="home" element={<Home main_data={mainData} height = {String(window.innerHeight-130-margin)+'px'}/>}/>
                {mainData.map(platform => (
                    platform.body.map(category => (
                        <Route path={'home/' + category.path} key={category.id}
                               element={<ProductList main_data={platform.body[category.id]}/>}/>
                    ))
                ))}
                {mainData.map(platform => (
                    platform.body.map(category => (
                        category.body.map(item => (
                            <Route path={'home/' + category.path + '/' + item.id} key={item.id}
                                   element={<CardProduct mainData={item}/>}/>
                        ))
                    ))
                ))}
                <Route path='home/basket' element={<Basket/>}/>
                <Route path="*" element={<ErrorPage/>}/>
            </Routes>

        </div>
    );
}

export default App;
