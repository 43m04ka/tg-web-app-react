import React from 'react';
import NavigationBar from "./Blocks/NavigationBar";
import EditDirectories from "./Tabs/EditCatalogs/EditDirectories";
import AP_EditCards from "./Tabs/EditCards/EditCards";

import styles from "./AdminPanel.module.scss";
import {Outlet, Route, Routes, useNavigate} from "react-router-dom";
import EditPages from "./Tabs/Structure/EditPages/EditPages";
import EditCatalogs from "./Tabs/Structure/EditCatalogs/EditCatalogs";
import useData from "./useData";
import History from "./Tabs/HistoryOrders/History";
import Promo from "./Tabs/Promo/Promo";
import Search from "./Tabs/Search/Search";
import InfoBlock from "./Tabs/InfoBloks/InfoBlock";

const AdminPanel = () => {

    const {authenticationData} = useData()
    const navigate = useNavigate();

    if(authenticationData === null){
        navigate('/admin')
    }

    const routeData = [{name: 'Редактировать каталоги', path: 'edit-directories', element: <EditDirectories/>},
        {name: 'Редактировать карты', path: 'edit-cards', element: <AP_EditCards/>},
        {name: 'Структура', path: 'structure', element: <EditCatalogs/>},
        {name: 'Поиск', path: 'search', element: <Search/>},
        {name: 'Акции в "ещё"', path: 'more', element: <InfoBlock/>},
        {name: 'Промокоды', path: 'promo', element: <Promo/>},
        {name: 'Страницы', path: 'pages', element: <EditPages/>},
        {name: 'История заказов', path: 'history-orders', element: <History/>},];

    return (
        <div className={styles['main-division']}>
            <NavigationBar routeData={[routeData]}/>
            <Routes>
                {routeData.map((route, index) => (
                    <Route path={route.path} key={index} element={route.element}/>
                ))}
            </Routes>
        </div>
    )
};
export default AdminPanel;