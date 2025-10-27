import React from 'react';
import style from './Search.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";
import HomeScreen from "./Elements/homeScreen";

const Search = () => {
    const {tg} = useTelegram()

    const [inputValue, setInputValue] = React.useState('')

    return (
        <div className={style['mainDivision']}>
            <div>
                <div>
                    <div/>
                    <input placeholder={'Поиск'} value={inputValue} onChange={(event)=>{setInputValue(event.target.value)}}></input>
                </div>
            </div>
            <div>
               <HomeScreen setInputValue={setInputValue}/>
            </div>
        </div>
    );
};

export default Search;