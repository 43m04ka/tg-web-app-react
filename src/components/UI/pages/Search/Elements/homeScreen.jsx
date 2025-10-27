import React, {useEffect, useState} from 'react';
import {useServer} from "../../AdminPanel/Tabs/Search/useServer";
import style from '../Search.module.scss'

const HomeScreen = () => {

    const {getClueList} = useServer()

    const [clueList, setClueList] = useState([])

    useEffect(() => {
        getClueList(setClueList)
    }, [])

    return (
        <div className={style['homeScreen']}>
            {clueList.map((item, index) => (
                <div>{item.name}</div>
            ))}
        </div>
    );
};

export default HomeScreen;