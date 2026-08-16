import React, {useEffect} from 'react';
import AdminSidebar from "./Blocks/AdminSidebar";
import AdminDock from "./Blocks/AdminDock";
import EditDirectories from "./Tabs/EditCatalogs/EditDirectories";
import AP_EditCards from "./Tabs/EditCards/EditCards";

import "./styles/adminFonts.css";
import styles from "./AdminPanel.module.scss";
import {Route, Routes, useNavigate} from "react-router-dom";
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
import Dashboard from "./Tabs/Dashboard/Dashboard";
import useGlobalData from "../../hooks/useGlobalData";
import useAdminTheme from "./useAdminTheme";
import {FeedbackProvider} from "./Elements/Feedback/Feedback";

// Меню намеренно без иконок — текстовая навигация в духе панелей управления хостингом.
const routeGroups = [
    {
        name: 'Каталог',
        items: [
            {name: 'Товары', path: 'edit-cards', element: <AP_EditCards/>},
            {name: 'Каталоги', path: 'edit-directories', element: <EditDirectories/>},
            {name: 'Структура', path: 'structure', element: <EditCatalogs/>},
            {name: 'Страницы', path: 'pages', element: <EditPages/>},
            {name: 'Подсказки в поиске', path: 'search', element: <Search/>},
            {name: 'Парсинг', path: 'parsing', element: <Parsing/>},
        ],
    },
    {
        name: 'Продажи',
        items: [
            {name: 'Заказы', path: 'history-orders', element: <History/>},
            {name: 'Промокоды', path: 'promo', element: <Promo/>},
            {name: 'Акции в "ещё"', path: 'more', element: <InfoBlock/>},
        ],
    },
    {
        name: 'Рассылки',
        items: [
            {name: 'Рассылка Tg', path: 'broadcast', element: <Broadcast/>},
        ],
    },
    {
        name: 'Система',
        items: [
            {name: 'Хостинг', path: 'hosting', element: <AdminGallery/>},
        ],
    },
];

const AdminPanel = () => {

    const {authenticationData} = useData()
    const {updatePageList} = useGlobalData()
    const navigate = useNavigate();
    const {theme, toggleTheme} = useAdminTheme();

    useEffect(() => {
        updatePageList(true);
    }, []);

    if(authenticationData === null){
        navigate('/admin')
    }

    return (
        <div className={styles['themeRoot']} data-theme={theme}>
            {/* Тосты и подтверждения — общие на всю панель: сообщение об итоге действия
                должно пережить закрытие вкладки, из которой его показали */}
            <FeedbackProvider>
                <div className={styles['main-division']}>
                    <AdminDock theme={theme} onToggleTheme={toggleTheme}/>
                    <div className={styles['body']}>
                        <AdminSidebar routeGroups={routeGroups}/>
                        <div className={styles['content']}>
                            <div className={styles['contentOutlet']}>
                                <Routes>
                                    <Route index element={<Dashboard/>} />
                                    {routeGroups.flatMap((group) => group.items).map((route, index) => (
                                        <Route path={route.path} key={index} element={route.element} />
                                    ))}
                                </Routes>
                            </div>
                        </div>
                    </div>
                </div>
            </FeedbackProvider>
        </div>
    )
};
export default AdminPanel;
