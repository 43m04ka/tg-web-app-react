import './App.css';

import React, {useEffect, useRef} from "react";
import {useTelegram} from "../hooks/useTelegram";
import {Route, Routes, useNavigate} from "react-router-dom";
import Catalog from "../pages/Catalog/Catalog";
import MainPage from "../pages/MainPage/MainPage";
import ErrorPage from "../pages/other/ErrorPage";
import AdminPanel from "../pages/AdminPanel/AdminPanel";
import History from "../pages/other/History";
import Favorites from "../pages/other/Favorites";
import AP_Authentication from "../pages/AdminPanel/AP_Authentication";
import useGlobalData from "../hooks/useGlobalData";
import {useServerUser} from "../hooks/useServerUser";
import Product from "../pages/Product/Product";
import CustomBackButton from "../shared/ui/CustomBackButton/CustomBackButton";
import DanyaDr from "../pages/DanyaDr/DanyaDr";
import style from './App.module.scss'
import SelectPlatform from '../pages/SelectPlatform/SelectPlatform';

const normalizeInitialState = (rawInitialData) => {
    const data = rawInitialData || {};
    const pickValue = (...keys) => {
        for (const key of keys) {
            if (typeof data[key] !== 'undefined') {
                return data[key];
            }
        }

        return undefined;
    };

    return {
        pages: pickValue('pages', 'allPages'),
        structureBlocks: pickValue('structureBlocks', 'allStructureBlocks'),
        mainPageProducts: pickValue('mainPageProducts'),
        allCatalogs: pickValue('allCatalogs', 'catalogs'),
        startPages: pickValue('startPages', 'allStartPages')
    };
};

let initialState = normalizeInitialState({});

try {
    const rawInitialData = window.__INITIAL_DATA__;
    const parsedInitialData =
        typeof rawInitialData === 'string'
            ? JSON.parse(rawInitialData)
            : (rawInitialData || {});

    initialState = normalizeInitialState(parsedInitialData);

    console.log('[App] initial data loaded:', {
        pages: Array.isArray(initialState.pages) ? initialState.pages.length : 'undefined',
        startPages: Array.isArray(initialState.startPages) ? initialState.startPages.length : 'undefined',
        structureBlocks: Array.isArray(initialState.structureBlocks) ? initialState.structureBlocks.length : 'undefined',
        mainPageProducts: Array.isArray(initialState.mainPageProducts) ? initialState.mainPageProducts.length : 'undefined',
        allCatalogs: Array.isArray(initialState.allCatalogs) ? initialState.allCatalogs.length : 'undefined'
    });
} catch (e) {
    console.error('Error parsing initial state:', e);
}

function App() {
    const {tg, user, isVk, isVkUserLoaded} = useTelegram();
    const navigate = useNavigate();
    const {syncUser} = useServerUser();
    const lastSyncedUserKeyRef = useRef('');

    const {
        pageList,
        pageId,
        updatePageList,
        catalogList,
        updateCatalogList,
        mainPageCards,
        updateMainPageCards,
        updateCatalogStructureList,
        updateStartPageList,
        startPageList,
        updatePreviewFavoriteData,
        updateBasket,
        setPageId,
        setInternalUserId
    } = useGlobalData();


    const [isLoaded, setIsLoaded] = React.useState(true);

    useEffect(() => {
        try {
            tg.disableVerticalSwipes();
            tg.lockOrientation();
            tg.isClosingConfirmationEnabled = true;
            tg.requestFullscreen();
            tg.ready();
        } catch (e) {
        }
    }, [])

    useEffect(() => {
        updatePageList(initialState.pages)
        updateCatalogStructureList(initialState.structureBlocks)
        updateMainPageCards(initialState.mainPageProducts)
        updateCatalogList(initialState.allCatalogs)
        updateStartPageList(initialState.startPages)
    }, [])

    useEffect(() => {
        if (typeof user === 'undefined') return;
        if (isVk && !isVkUserLoaded) return;

        const userKey = `${user.platform || 'tg'}:${user.id}:${user.username || user.first_name || ''}`;
        if (lastSyncedUserKeyRef.current === userKey) return;

        lastSyncedUserKeyRef.current = userKey;
        syncUser(user, (internalId) => {
            setInternalUserId(internalId);
            updatePreviewFavoriteData();
        });
    }, [user, isVk, isVkUserLoaded])

    useEffect(() => {
        if (catalogList !== null) {
            updateBasket(catalogList, pageId)
        }
    }, [pageId])

    if (catalogList !== null && pageList !== null && mainPageCards !== null && startPageList !== null && isLoaded) {
        setTimeout(() => {
            setIsLoaded(false)
        }, 150)
    }

    if (!isLoaded) {
        if (window.location.pathname === '/') {
            const tgParam = tg.initDataUnsafe.start_param;
            const urlParam = new URLSearchParams(window.location.search).get('startapp');
            const param = typeof tgParam !== 'undefined' ? String(tgParam) : (urlParam || null);
            if (param !== null) {
                navigate(pageList[0]['link']);
                if (param.startsWith('catalog_')) {
                    navigate('/catalog/' + param.slice('catalog_'.length));
                } else {
                    navigate('/card/' + param);
                }
            } else {
                navigate('/selectPlatform')
            }
        }
        return (<div className={style['App']} style={{height: String(window.innerHeight) + 'px'}}>
            <CustomBackButton />
            <Routes>
                <Route path={'/main/*'} element={<MainPage/>}/>
                <Route path={'/favorites'} element={<Favorites/>}/>
                <Route path={"/selectPlatform"} element={<SelectPlatform/>}/>
                <Route path={'/catalog/*'} element={<Catalog/>}/>
                <Route path={'/card/*'} element={<Product/>}/>
                <Route path={'/choice-catalog/*'} element={<Product/>}/>
                <Route path={'/admin-panel/*'} element={<AdminPanel/>}/>
                <Route path={'/admin'} element={<AP_Authentication/>}/>
                <Route path={'/history'} element={<History/>}/>
                <Route path={'/danya_dr'} element={<DanyaDr/>}/>
                <Route path="*" element={<ErrorPage/>}/>
            </Routes>
        </div>);
    } else {
        return (<div className={style["container"]}>
            <div className={style['fillContainer']}>
                <div
                    style={{scale: (catalogList !== null && pageList !== null && mainPageCards !== null ? '12' : '0')}}/>
            </div>
        </div>);
    }
}

export default App;
