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
                                               location,
                                               isAnimating,
                                               pendingNavigation,
                                               setIsAnimating,
                                               setPendingNavigation,
                                               pageType
                                           }) => {
    const [activeTab, setActiveTab] = useState('home');

    const buttons = useMemo(() => {
        const currentPlatform = pageList.find(item => item.id === pageId);
        return [{
            id: 'home', label: 'Главная', path: 'catalogs', opacity: 0
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

    // Определяем текущий pageType для подсчета видимых кнопок
    const currentDisplayPageType = (isAnimating && pendingNavigation && pendingNavigation.targetPageType) 
        ? pendingNavigation.targetPageType 
        : pageType;

    const visibleButtons = useMemo(
        () => currentDisplayPageType === 'steam'
            ? buttons.filter(button => button.id !== 'search' && button.id !== 'basket')
            : buttons,
        [buttons, currentDisplayPageType],
    );

    useEffect(() => {
        const pathname = location.pathname;

        // Если платформа не выбрана, принудительно тушим шапку
        if (pageId === -1) {
            setActiveTab('platform');
            setZIndexTab(-100);
            setOpacityTab(0);
            return;
        }

        if (!pathname.startsWith('/main')) {
            setActiveTab('home');
            setZIndexTab(-100);
            setOpacityTab(0);
            return;
        }

        const currentButton = visibleButtons.find(button => {
            return pathname.endsWith(button.path) || pathname.includes('/' + button.path);
        });

        if (!currentButton) {
            setActiveTab('home');
            setZIndexTab(-100);
            setOpacityTab(0);
            return;
        }

        setActiveTab(currentButton.id);

        // Если это смена платформы или главная страница
        if (currentButton.id === 'platform' || currentButton.id === 'home') {
            setOpacityTab(1);
            setZIndexTab(100);
        } else {
            setOpacityTab(currentButton.opacity);
            setZIndexTab(currentButton.opacity === 0 ? -100 : 100);
        }

        updateBasket(catalogList, pageId);
    }, [location.pathname, visibleButtons, pageId, catalogList]);

    const onButtonClick = (button) => {
        const params = new URLSearchParams(location.search);
        const valueOfKey = params.get('from');
        const basePath = '/' + location.pathname.split('/').filter(Boolean)[0]; // '/main'

        // Проверяем, нужно ли скрывать/показывать кнопки
        const targetPage = pageList.find(p => basePath + '/' + button.path === '/' + p.link);
        const targetPageType = targetPage?.type || null;
        const needsAnimation = (pageType === 'steam' && targetPageType !== 'steam') ||
                             (pageType !== 'steam' && targetPageType === 'steam');

        if (!location.pathname.includes(button.path)) {
            setOpacityTab(0.01);
        }

        if (button.id === 'home') {
            if (valueOfKey === 'product') {
                navigate(-1);
            } else {
                if (needsAnimation) {
                    // Сразу скрываем контент и запускаем анимацию кнопок
                    setOpacityTab(0);
                    setIsAnimating(true);
                    setPendingNavigation({ basePath, button, targetPageType });
                    
                    // Ждем завершения анимации кнопок (300ms), затем навигация
                    setTimeout(() => {
                        navigate(basePath + '/catalogs');
                        setIsAnimating(false);
                        setPendingNavigation(null);
                    }, 300);
                } else {
                    setOpacityTab(0);
                    setTimeout(() => navigate(basePath + '/catalogs'), 100);
                }
            }
        } else {
            if (needsAnimation) {
                // Сразу скрываем контент и запускаем анимацию кнопок
                setOpacityTab(0);
                setIsAnimating(true);
                setPendingNavigation({ basePath, button, targetPageType });
                
                // Ждем завершения анимации кнопок (300ms), затем навигация
                setTimeout(() => {
                    navigate(basePath + '/' + button.path);
                    setIsAnimating(false);
                    setPendingNavigation(null);
                }, 300);
            } else {
                setTimeout(() => navigate(basePath + '/' + button.path), 100);
            }
        }

        setActiveTab(button.id);
    };

    return {activeTab, visibleButtons, onButtonClick};
};