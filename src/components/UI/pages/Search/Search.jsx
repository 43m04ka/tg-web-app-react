import React from 'react';
import style from './Search.module.scss'

const Search = () => {
    return (
        <div className={style['mainDivision']}>
            <div>
                <div>
                    <div/>
                    <input placeholder={'Поиск'}></input>
                </div>
            </div>
        </div>
    );
};

export default Search;