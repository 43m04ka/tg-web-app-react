//import logo from './logo.svg';
import './App.css';
import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes} from "react-router-dom";
import ProductList from "./components/UI/ProductList";
import Home from "./components/UI/Home";
import ErrorPage from "./components/UI/ErrorPage";
import Search from "./components/UI/Search";
import CardProduct from "./components/UI/CardProduct";
import Basket from "./components/UI/Basket";
import AdminPanel from "./components/UI/AdminPanel";
import Info from "./components/UI/Info";
import ProductListSelector from "./components/UI/ProductListSelector";


let isGetData = true;

function App() {
    const {tg} = useTelegram();
    const [size, setSize] = React.useState(window.innerHeight);
    const [mainData, setMainData] = useState([
        {id: 0, page: 'playstation', body: [[], []]}, {
            id: 1,
            page: 'xbox',
            body: [[], []]
        }, {id: 2, page: 'service', body: [[], []]}]);
    const [status, setStatus] = useState(0);

    const sendGetData = {
        method: 'get',
    }

    const onGetData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendGetData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                console.log(prom.body)
                setMainData(prom.body)
                setStatus(1)
            })
        })
    }, [sendGetData])

    const resizeHandler = () => {
        if (window.innerWidth > 1000) {
            try {
                tg.exitFullscreen()
            } catch (err) {
            }
        }
        setSize(window.innerHeight);
    };

    useEffect(() => {
        if (isGetData) {
            onGetData()
            isGetData = false;
        }
    }, []);

    React.useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);

    useEffect(() => {
        tg.disableVerticalSwipes();
        try {
            tg.requestFullscreen()
            tg.expand()
        } catch (err) {
            console.log(err)
        }
        tg.ready();
    }, [])

    if (status === 1) {
        return (
            <div className="App">
                <div style={{height: String(tg?.contentSafeAreaInset.top) + 'px'}}></div>
                <div style={{height: String(tg?.safeAreaInset.top) + 'px'}}></div>
                <Routes>
                    <Route path="home" element={<Home main_data={mainData} width={window.innerWidth} height={size}/>}/>

                    {mainData.map(platform => (
                        platform.body[1].map(category => (
                            <Route path={'home/' + category.path} key={category.id}
                                   element={<ProductList main_data={category} page={platform.id} height={size}/>}/>
                        ))
                    ))}

                    {mainData.map(platform => (
                        platform.body[0].map(category => (
                            <Route path={'home/' + category.path} key={category.id}
                                   element={<ProductListSelector main_data={category} page={platform.id} height={size}/>}/>
                        ))
                    ))}
                    {mainData.map(platform => (
                        platform.body[1].map(category =>
                            (category.body.map(item =>
                                    (<Route path={'home/' + category.path + '/' + item.id} key={item.id}
                                            element={<CardProduct mainData={item} height={size}/>}/>)
                                )
                            ))
                    ))}
                    <Route path={'home/basket'} element={<Basket height={size}/>}/>
                    {mainData.map(platform => (
                        <Route path={'home/search' + String(platform.id)}
                               element={<Search data={platform} height={size}/>}/>
                    ))}
                    <Route path={'admin'} element={<AdminPanel/>}/>
                    <Route path={'home/info'} element={<Info/>}/>
                    <Route path="*" element={<ErrorPage/>}/>
                </Routes>

            </div>
        );
    } else {
        return (<div className={'pong-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(size / 2 - 60) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}>Ожидайте</div>);
    }
}

export default App;
