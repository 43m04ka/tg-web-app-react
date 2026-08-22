import React, {useEffect} from 'react';
import AdminSidebar from "./Blocks/AdminSidebar";
import AdminDock from "./Blocks/AdminDock";
import EditDirectories from "./Tabs/EditCatalogs/EditDirectories";
import AP_EditCards from "./Tabs/EditCards/EditCards";

import "./styles/adminFonts.css";
import styles from "./AdminPanel.module.scss";
import {Route, Routes, useNavigate} from "react-router-dom";
import EditPages from "./Tabs/Structure/EditPages/EditPages";
import EditStartPages from "./Tabs/Structure/EditStartPages/EditStartPages";
import SoonScreen from "./Tabs/Soon/SoonScreen";
import useData from "./useData";
import History from "./Tabs/HistoryOrders/History";
import Promo from "./Tabs/Promo/Promo";
import Search from "./Tabs/Search/Search";
import InfoBlock from "./Tabs/InfoBloks/InfoBlock";
import AdminGallery from "./Tabs/Hosting/AdminGallary";
import Parsing from "./Tabs/Parsing/Parsing";
import Broadcast from "./Tabs/Broadcast/Broadcast";
import Dashboard from "./Tabs/Dashboard/Dashboard";
import useGlobalData from './legacy/useGlobalData';
import useAdminTheme from "./useAdminTheme";
import {FeedbackProvider} from "./Elements/Feedback/Feedback";

// Меню намеренно без иконок — текстовая навигация в духе панелей управления хостингом.
//
// Деление по тому, чем оперирует админ: товарные данные, внешний вид витрины, продажи,
// всё остальное. Пути разделов не менялись даже там, где сменилась подпись, — закладки
// и ссылки из чужих переписок должны продолжать работать.
const routeGroups = [
    {
        // Товарные данные и источники цен. Стоит первой, сразу под главной:
        // это основная работа в панели.
        name: 'Данные',
        items: [
            {name: 'Товары', path: 'edit-cards', element: <AP_EditCards/>},
            {name: 'Каталоги', path: 'edit-directories', element: <EditDirectories/>},
            // Раздел назывался «Парсинг», хотя парсинг отсюда никогда не запускался:
            // внутри три таблицы наценки. Путь оставлен прежним
            {name: 'Сетки цен', path: 'parsing', element: <Parsing/>},
            // Витрины, которые не собираются каталогами и блоками. Пока заготовки:
            // на них ведут кнопки из правой половины «Страниц»
            {
                name: 'Steam', path: 'steam', element: (
                    <SoonScreen
                        title="Steam"
                        subtitle="витрина пополнения баланса"
                        description="Пополнение Steam не собирается каталогами и блоками — суммы и проценты считаются на сервере, а тарифы задаются на главной. Настройки самой витрины появятся здесь."
                    />
                ),
            },
            {
                name: 'Сервисы', path: 'services', element: (
                    <SoonScreen
                        title="Сервисы"
                        subtitle="витрина сервисов"
                        description="Страницы типа «Сервисы» продаются как обычные товары, но карусель и тело сайта им не нужны. Настройки витрины появятся здесь."
                    />
                ),
            },
        ],
    },
    {
        // Всё, что покупатель видит в боте: сами страницы, их оформление и стартовый экран.
        // «Структура» отдельным разделом больше не нужна — карусель и тело страницы
        // редактируются в правой половине «Страниц», рядом с самой страницей, поэтому
        // раздел и называется «Страницы и главная».
        name: 'Визуал',
        items: [
            {name: 'Страницы и главная', path: 'pages', element: <EditPages/>},
            {name: 'Стартовый экран', path: 'start-menu', element: <EditStartPages/>},
            {name: 'Подсказки в поиске', path: 'search', element: <Search/>},
            {name: 'Акции в "ещё"', path: 'more', element: <InfoBlock/>},
        ],
    },
    {
        name: 'Продажи',
        items: [
            {name: 'Заказы', path: 'history-orders', element: <History/>},
            {name: 'Промокоды', path: 'promo', element: <Promo/>},
        ],
    },
    {
        name: 'Прочее',
        items: [
            {name: 'Рассылка Tg', path: 'broadcast', element: <Broadcast/>},
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
