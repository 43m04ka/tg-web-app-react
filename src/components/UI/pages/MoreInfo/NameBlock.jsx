import React from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import style from './MoreInfo.module.scss'

const NameBlock = () => {

    const {user} = useTelegram()

    if (user.first_name !== 'undefined') {
        return (
            <div className={style['nameBlock']}>
                <p>Привет, {user.first_name.slice(0, 15)}!</p>
                <div/>
            </div>
        );
    }
};

export default NameBlock;