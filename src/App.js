//import logo from './logo.svg';
import './App.css';
import {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import {Route, Routes} from "react-router-dom";
import ProductList from "./components/ProductList/ProductList";
import Form from "./components/Form/Form";
import HomePage from "./components/HomePage/HomePage";

function App() {

    const {tg} = useTelegram()


    useEffect(() => {
        tg.ready();
    }, [])

    return (
        <div className="App">
            <Header />
            <Routes>
                <Route index element={<HomePage/>}/>
                <Route path={'form'} element={<Form/>}/>
            </Routes>
        </div>
    );
}

export default App;
