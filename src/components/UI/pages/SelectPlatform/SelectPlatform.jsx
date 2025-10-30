import React from 'react';
import style from './SelectPlatform.module.scss'
import useGlobalData from "../../../../hooks/useGlobalData";

const SelectPlatform = () => {
    const {pageList, setPageId} = useGlobalData()

    return (
        <div className={style['container']}>
            {pageList.map((item, index) => (
                <>
                    <div onClick={() => setPageId(item.id)}>
                        <div>{item.name}</div>
                        <div style={{backgroundImage: `url(${item.url})`}}/>
                    </div>
                    { index + 1 !== pageList.length ? <div/> : ''}
                </>
            ))}
        </div>
    );
};

export default SelectPlatform;