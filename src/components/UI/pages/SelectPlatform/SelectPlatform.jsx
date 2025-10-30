
import React, {useEffect} from 'react';
import style from './SelectPlatform.module.scss'
import useGlobalData from "../../../../hooks/useGlobalData";
import {useNavigate} from "react-router-dom";

const SelectPlatform = ({setActiveTab, activeTab}) => {
    const {pageList, setPageId} = useGlobalData()
    const [mouseDownId, setMouseDownId] = React.useState(-1);
    const [isOpen, setIsOpen] = React.useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        if(activeTab !== 3) {
            setIsOpen(false)
        }
    }, [activeTab]);

    return (
        <div className={style['container']} id={-2}
             onTouchStart={(e) => {
                 let id = Number(document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY).id || -1)
                 if (id !== mouseDownId) {
                     setMouseDownId(Number(id))
                 }
                 if (isOpen && id === -2) {
                     setIsOpen(false)
                     setActiveTab(0)
                 }else{
                     setIsOpen(true)
                     setActiveTab(3)
                 }
             }}
             onTouchMove={(e) => {
                 let id = document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY).id || -1
                 if (id !== mouseDownId) {
                     setMouseDownId(Number(id))
                     window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                 }
             }} onTouchEnd={(e) => {
            let id = Number(document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY).id)
            if ((typeof id !== 'undefined') && id !== -1 && id !== -2) {
                setPageId(pageList[id].id)
                setActiveTab(0)
            }
            if (id !== -2 || (id === -2 && isOpen && (mouseDownId !== -2))) {
                setIsOpen(false)
            }
        }}>
            <div style={!isOpen ? {scale: '0', opacity:'0', height:'0'} : {height: String((7 * (pageList.length + 2) + 4)/100 * window.innerWidth) + 'px', opacity:'1', scale:'1'}}>
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