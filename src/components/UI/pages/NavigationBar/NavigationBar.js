import React, {useEffect} from 'react';
import style from './NavigationBar.module.scss'
import {useNavigate} from "react-router-dom";

const NavigationBar = ({setHeightTab, heightTab}) => {

    const navigate = useNavigate()

    const buttons = [{label: 'Главная', icon: 'main', path: '', heightTab: 0},
        {label: 'Поиск', icon: 'search', path: 'search', heightTab: '80vh'},
        {label: 'Корзина', icon: 'basket', path: 'basket', heightTab: '80vh'},
        {label: 'Платформа', icon: 'PS', path: 'selectPlatform', heightTab: '80vh'},
        {label: 'Еще', icon: 'more', path: 'more', heightTab: '80vh'}]

    const [activeTab, setActiveTab] = React.useState(0);

    useEffect(() => {
        console.log(window.location.pathname)
    }, [window.location.pathname])

    return (<div className={style['container']}>
        <div>
            {buttons.map((button, index) => (
                <div className={style['activeTab-' + (activeTab === index)]} onClick={() => {
                    setActiveTab(index);
                    if(button.heightTab !== 0){
                        navigate(button.path)
                        setHeightTab(button.heightTab)
                    }else{
                        setHeightTab(button.heightTab)
                        setTimeout(()=> navigate(button.path),300)
                    }
                }}>
                    <div className={style['button-' + button.icon]}/>
                    <p>{button.label}</p>
                </div>))}
        </div>
    </div>);
};

export default NavigationBar;