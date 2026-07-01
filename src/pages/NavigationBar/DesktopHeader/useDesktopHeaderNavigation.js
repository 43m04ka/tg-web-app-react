import {useEffect, useMemo, useState} from "react";

function countOccurrences(str, sub) {
    const matches = str.match(new RegExp(sub, 'g'));
    return matches ? matches.length : 0;
}

export const useDesktopHeaderNavigation = ({
    pageList,
    pageId,
    updateBasket,
    catalogList,
    setOpacityTab,
    setZIndexTab,
    navigate,
    location
}) => {
    const [activeTab, setActiveTab] = useState('home');

    const buttons = useMemo(() => {
        const currentPlatform = pageList.find(item => item.id === pageId);
        return [{
            id: 'home', label: 'Главная', path: '', opacity: 0
        }, {
            id: 'search', label: 'Поиск', path: 'search', opacity: 1
        }, {
            id: 'basket', label: 'Корзина', path: 'basket', opacity: 1
        }, {
            id: 'platform', label: currentPlatform?.name || 'Платформа', path: 'selectPlatform', opacity: 1
        }, {
            id: 'more', label: 'Еще', path: 'more', opacity: 1
        }];
    }, [pageList, pageId]);

    const visibleButtons = pageList.length <= 1
        ? buttons.filter(button => button.id !== 'platform')
        : buttons;

    useEffect(() => {
        const pathname = location.pathname;

        if (countOccurrences(pathname, '/') !== 2) {
            setActiveTab('home');
            setZIndexTab(-100);
            setOpacityTab(0);
            return;
        }

        const currentButton = visibleButtons.find(button => {
            if (button.path === '') return false;
            return pathname.includes(button.path);
        });

        if (!currentButton) {
            setActiveTab('home');
            setZIndexTab(-100);
            setOpacityTab(0);
            return;
        }

        setActiveTab(currentButton.id);
        setOpacityTab(currentButton.opacity);
        setZIndexTab(currentButton.opacity === 0 ? -100 : 100);
        updateBasket(catalogList, pageId);
    }, [location.pathname, visibleButtons, pageId, catalogList]);

    const onButtonClick = (button) => {
        const params = new URLSearchParams(location.search);
        const valueOfKey = params.get('from');
        const basePath = '/' + location.pathname.split('/').filter(Boolean)[0];

        if (!location.pathname.includes(button.path) && button.path !== '') {
            setOpacityTab(0.01);
        }

        if (button.path === '') {
            if (valueOfKey === 'product') {
                navigate(-1);
            } else {
                setOpacityTab(0);
                setTimeout(() => navigate(basePath), 100);
            }
        } else {
            setTimeout(() => navigate(basePath + '/' + button.path), 100);
        }

        setActiveTab(button.id);
    };

    return {activeTab, visibleButtons, onButtonClick};
};
