import React from 'react';
import style from './Search.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";

const Search = () => {
    const {tg} = useTelegram()
    console.log(tg.viewportStableHeight)

    return (
        <div className={style['mainDivision']}>
            <div>
                <div>
                    <div/>
                    <input placeholder={'Поиск'}></input>
                </div>
            </div>
            <div style={{textAlign:'right', margin:'auto 0 200px auto'}}>
               {tg.viewportHeight}
               {tg.viewportStableHeight}
            </div>
        </div>
    );
};

export default Search;