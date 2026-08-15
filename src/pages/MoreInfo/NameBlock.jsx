import React from 'react';
import style from './MoreInfo.module.scss'
import {usePlatformUser} from "../../hooks/usePlatformUser";

const NameBlock = () => {

    const { user } = usePlatformUser();

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
