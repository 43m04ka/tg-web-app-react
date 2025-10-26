import React from 'react';
import style from './Search.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";

const Search = () => {
    const {tg} = useTelegram()
    console.log(tg.viewportHeight)

    return (
        <div className={style['mainDivision']}>
            <div>
                <div>
                    <div/>
                    <input placeholder={'Поиск'} value={tg.viewportHeight}></input>
                </div>
            </div>
        </div>
    );
};

export default Search;