import React, {useEffect, useState} from 'react';
import {useServer} from "../../AdminPanel/Tabs/Search/useServer";
import style from '../Search.module.scss'

const HomeScreen = ({setInputValue}) => {

    const {getClueList} = useServer()

    const [clueList, setClueList] = useState([])

    useEffect(() => {
        getClueList(setClueList).then()
    }, [])

    return (
        <div className={style['homeScreen']}>
            <div >
                {clueList.map((item, index) => (
                    <div className={style['animClue']} style={{
                        webkitAnimationDelay: String(0.1 * index) + 's',
                        animationDelay: String(0.1 * index + 0.2) + 's'
                    }} onClick={() => {
                        setInputValue(item.name)
                    }}>{item.name}</div>
                ))}
            </div>
        </div>
    );
};

export default HomeScreen;