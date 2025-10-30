import React from 'react';
import style from './SelectPlatform.module.scss'
import useGlobalData from "../../../../hooks/useGlobalData";

const SelectPlatform = () => {
    const {pageList, setPageId} = useGlobalData()
    const [mouseDownId, setMouseDownId] = React.useState(-1);

    return (
        <div className={style['container']} onTouchMove={(e) => {
            let id = document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY).id || -1
            if (id !== mouseDownId) {
                setMouseDownId(Number(id))
            }
        }}>
            {pageList.map((item, index) => (
                <>
                    <div className={style[mouseDownId === index ? 'selectedItem' : '']} id={index}>
                        <div id={index}>{item.name}</div>
                        <div id={index} style={{backgroundImage: `url(${item.url})`}}/>
                    </div>
                    {index + 1 !== pageList.length ? <div/> : ''}
                </>
            ))}
        </div>
    );
};

export default SelectPlatform;