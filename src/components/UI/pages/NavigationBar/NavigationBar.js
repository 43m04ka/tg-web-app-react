import React, {useEffect} from 'react';
import style from './NavigationBar.module.scss'

const NavigationBar = () => {

    const buttons = [{label: 'Главная', icon: 'main'}, {label: 'Поиск', icon: 'search'}, {
        label: 'Корзина',
        icon: 'basket'
    }, {label: 'Платформа', icon: 'PS'}, {label: 'Еще', icon: 'more'}]

    const [activeTab, setActiveTab] = React.useState(0);

    useEffect(() => {
        console.log(window.location.pathname)
    }, [window.location])

    return (
        <div className={style['container']}>
            <div>
                {buttons.map((button, index) => (
                    <div className={style['activeTab-' + (activeTab === index)]} onClick={() => setActiveTab(index)}>
                        <div className={style['button-' + button.icon]}/>
                        <p>{button.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NavigationBar;