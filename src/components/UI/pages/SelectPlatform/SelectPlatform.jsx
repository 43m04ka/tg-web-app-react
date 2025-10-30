import React from 'react';
import style from './SelectPlatform.module.scss'
import useGlobalData from "../../../../hooks/useGlobalData";

const SelectPlatform = ({onClose}) => {
    const {pageList, setPageId} = useGlobalData()
    const [mouseDownId, setMouseDownId] = React.useState(-1);
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <div className={style['container']} id={-2}
             onTouchStart={(e) => {
                 let id = Number(document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY).id || -1)
                 if (id !== mouseDownId) {
                     setMouseDownId(Number(id))
                 }
                 if (isOpen && id === -2) {
                     setIsOpen(false)
                 }else{
                     setIsOpen(true)
                 }
             }}
             onTouchMove={(e) => {
                 let id = document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY).id || -1
                 if (id !== mouseDownId) {
                     setMouseDownId(Number(id))
                 }
             }} onTouchEnd={(e) => {
            let id = Number(document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY).id)
            if ((typeof id !== 'undefined') && id !== -1 && id !== -2) {
                setPageId(pageList[id].id)
            }
            if (id !== -2 || (id === -2 && isOpen && (mouseDownId !== -2))) {
                setTimeout(() => setIsOpen(false), 50)
            }
        }}>
            <div style={!isOpen ? {height: '0'} : {height: String((7 * (pageList.length + 2.1))/100 * window.innerWidth) + 'px'}}>
                <div className={style['label']}>Выберите платформу</div>
                {pageList.map((item, index) => (
                    <>
                        <div className={style[mouseDownId === index ? 'selectedItem' : '']} id={index}>
                            <div id={index} style={{backgroundImage: `url(${item.url})`}}/>
                            <div id={index}>{item.name}</div>
                        </div>
                    </>
                ))}</div>
        </div>
    );
};

export default SelectPlatform;