import React, {useEffect, useState} from 'react';
import {useServer} from "../../AdminPanel/Tabs/Search/useServer";
import style from '../Search.module.scss'
import useGlobalData from "../../../../../hooks/useGlobalData";


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Перестановка элементов
    }
    return array;
}

const HomeScreen = ({setInputValue}) => {

    const {getClueList} = useServer()
    const {pageId} = useGlobalData()

    const [clueList, setClueList] = useState([])

    useEffect(() => {
        getClueList((res)=> setClueList(shuffleArray(res))).then()
    }, [])

    return (
        <div className={style['homeScreen']}>
            {clueList.map((item, index) => {
                if (item.structurePageId === pageId) {
                    return (
                        <div className={style['animClue']} style={{
                            webkitAnimationDelay: String(0.1 * index) + 's',
                            animationDelay: String(0.1 * index + 0.2) + 's'
                        }} onClick={() => {
                            setInputValue(item.name)
                        }}>{item.name}</div>)
                }
            })}
        </div>
    );
};

export default HomeScreen;