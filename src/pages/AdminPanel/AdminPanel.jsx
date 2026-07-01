import React, {useEffect} from 'react';
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
import AdminGallery from "./Tabs/Hosting/AdminGallary";
import Parsing from "./Tabs/Parsing/Parsing";
import Broadcast from "./Tabs/Broadcast/Broadcast";
import useGlobalData from "../../hooks/useGlobalData";

const AdminPanel = () => {

    const {authenticationData} = useData()
    const {updatePageList} = useGlobalData()
    const navigate = useNavigate();

    useEffect(() => {
        updatePageList(true);
    }, []);

    if(authenticationData === null){
        navigate('/admin')
    }

    const routeData = [
        {name: 'Редактировать карты', path: 'edit-cards', element: <AP_EditCards/>},
        {name: 'Редактировать каталоги', path: 'edit-directories', element: <EditDirectories/>},
        {name: 'Структура', path: 'structure', element: <EditCatalogs/>},
        {name: 'Страницы', path: 'pages', element: <EditPages/>},
        {name: 'Подсказки в поиске', path: 'search', element: <Search/>},
      
        
        {name: 'История заказов', path: 'history-orders', element: <History/>},


        {name: 'Промокоды', path: 'promo', element: <Promo/>},
        {name: 'Акции в "ещё"', path: 'more', element: <InfoBlock/>},
      

        {name: 'Рассылка', path: 'broadcast', element: <Broadcast/>},
        {name: 'Парсинг', path: 'parsing', element: <Parsing/>},
        {name: 'Хостинг', path: 'hosting', element: <AdminGallery/>}
      ];

    return (
        <div className={styles['main-division']}>
            <NavigationBar routeData={[routeData]}/>
            <div className={styles['content']}>
                <div className={styles['contentOutlet']}>
                    <Routes>
                        {routeData.map((route, index) => (
                            <Route path={route.path} key={index} element={route.element} />
                        ))}
                    </Routes>
                </div>
            </div>
        </div>
    )
};
export default AdminPanel;
