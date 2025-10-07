import React from 'react';
import style from './PopUpWindow.module.scss';

const PopUpWindow = ({children, title}) => {

    return (
        <div className={style['main']}>
            <div className={style['container']}>
                <div className={style['title']}>{title}</div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PopUpWindow;