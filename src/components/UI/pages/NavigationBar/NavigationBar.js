import React from 'react';
import style from './NavigationBar.module.scss'

const NavigationBar = () => {

    const buttons = [{label:'Главный', icon:'main'}, {label: 'Поиск', icon:'search'}, {label: 'Корзина', icon:'basket'}, {label: 'Платформа', icon:'PS'}, {label: 'Еще', icon:'more'}]

    return (
        <div className={style['container']}>
            <div>
                {buttons.map((button, index) => (
                    <div>
                        <div className={style['button-'+button.icon]}/>
                        <p>{button.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NavigationBar;