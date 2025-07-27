import React from 'react';
import NavigationBar from "./Blocks/NavigationBar";
import UploadData from "./Tabs/UploadData/UploadData";
import EditDirectories from "./Tabs/EditCatalogs/EditDirectories";
import AP_EditCards from "./Tabs/EditCards/EditCards";

import styles from "./AdminPanel.module.scss";
import {Outlet, Route, Routes} from "react-router-dom";
import EditPages from "./Tabs/AP_EditPages/EditPages";
import EditStructure from "./Tabs/EditStructure/EditStructure";

const AdminPanel = () => {

    const routeData = [{name: 'Загрузить новые данные', path: 'upload-data', element: <UploadData/>},
        {name: 'Редактировать каталоги', path: 'edit-directories', element: <EditDirectories/>},
        {name: 'Редактировать карты', path: 'edit-cards', element: <AP_EditCards/>},
        {name: 'Редактировать каталоги', path: 'edit-structure', element: <EditStructure/>},
        {name: 'Редактировать страницы', path: 'edit-pages', element: <EditPages/>}]
    const routeData1 = [{name: 'Промокоды', path: 'promo', element: <Outlet/>},
        {name: 'История заказов', path: 'history-orders', element: <Outlet/>},
        {name: 'Кубик', path: 'cube', element: <Outlet/>}];

    return (
        <div className={styles['main-division']}>
            <NavigationBar routeData={[routeData, routeData1]}/>
            <Routes>
                {[...routeData, ...routeData1].map((route, index) => (
                    <Route path={route.path} key={index} element={route.element}/>
                ))}
            </Routes>
        </div>
    )
};
export default AdminPanel;