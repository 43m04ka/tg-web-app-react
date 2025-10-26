import React, {useEffect, useState} from 'react';
import style from './NavigationBar.module.scss'
import {useNavigate} from "react-router-dom";
import {useTelegram} from "../../../../hooks/useTelegram";

const NavigationBar = ({setHeightTab, heightTab, setZIndexTab}) => {

    const {tg} = useTelegram()

    const [typeBar, setTypeBar] = useState(false)

    const navigate = useNavigate()

    const buttons = [
        {label: 'Главная', icon: 'main', path: '', heightTab: 0},
        {
            label: 'Поиск',
            icon: 'search',
            path: 'search',
            heightTab: String(window.innerHeight - tg.contentSafeAreaInset.top - tg.safeAreaInset.top - 10) + 'px'
        },
        {
            label: 'Корзина',
            icon: 'basket',
            path: 'basket',
            heightTab: String(window.innerHeight - tg.contentSafeAreaInset.top - tg.safeAreaInset.top - 10) + 'px'
        },
        {label: 'Платформа', icon: 'PS', path: 'selectPlatform', heightTab: 'max-content'},
        {
            label: 'Еще',
            icon: 'more',
            path: 'more',
            heightTab: String(window.innerHeight - tg.contentSafeAreaInset.top - tg.safeAreaInset.top - 10) + 'px'
        }]

    const [activeTab, setActiveTab] = React.useState(0);

    useEffect(() => {
        buttons.map((button, index) => {
            if (window.location.pathname.includes(button.path)) {
                setActiveTab(index);
            }
        })
    }, [])

    return (<div className={style[typeBar ? 'container' : 'island']}
                 style={typeBar ? {paddingBottom: String(tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px'} :
                     {marginBottom: String(tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom + (window.screen.availHeight - window.innerHeight)) + 'px'}}>
        {typeBar ? '' : <div>
            <div style={{marginLeft: String(19.5 * (activeTab)) + '%'}}/>
        </div>}
        <div>

            {buttons.map((button, index) => (
                <div className={style['activeTab-' + (activeTab === index)]} onClick={() => {

                    if (button.path === 'selectPlatform') {
                        setTypeBar(!typeBar)
                    } else {
                        setActiveTab(index);
                        if (button.heightTab !== 0 || heightTab === 0) {
                            setTimeout(() => {
                                navigate(button.path)
                                setHeightTab(button.heightTab)
                                setZIndexTab(button.heightTab === 0 ? -10 : 10)
                            }, 100)
                        } else {
                            setHeightTab(button.heightTab)
                            setTimeout(() => {
                                navigate(button.path);
                                setZIndexTab(button.heightTab === 0 ? -10 : 10)
                            }, 300)

                        }
                    }

                }}>
                    <div className={style['button-' + button.icon]}/>
                    <p>{button.label}</p>
                </div>))}
        </div>
    </div>);
};

export default NavigationBar;