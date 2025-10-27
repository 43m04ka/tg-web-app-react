import React from 'react';
import style from './Search.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";
import HomeScreen from "./Elements/homeScreen";

const Search = () => {
    const {tg} = useTelegram()

    return (
        <div className={style['mainDivision']}>
            <div>
                <div>
                    <div/>
                    <input placeholder={'Поиск'}></input>
                </div>
            </div>
            <div>
               <HomeScreen/>
            </div>
        </div>
    );
};

export default Search;