import React, {useEffect, useRef, useState} from 'react';
import '../../../styles/style.css';
import {useTelegram} from "../../../../hooks/useTelegram";
import HeadSelector from "../../HeadSelector";
import CatalogListBody from "./CatalogListBody";
import CatalogListHead from "./CatalogListHead";
import {Navigate} from "react-router-dom";
import NavigationBar from "../NavigationBar/NavigationBar";

let scrollCtrl = 0;
let lastScroll = 0;

let lastPageId = 0

const MainPage = ({pageList, height}) => {
    const {tg} = useTelegram();
    const [hiddenSelector, setHiddenSelector] = useState(false);
    const scrollContainer = useRef();
    const [pageId, setPageId] = React.useState(lastPageId);

    pageList.map((item, index) => {
        if ('/' + item.link === window.location.pathname) {
            if (pageList[index].id !== pageId) {
                lastPageId = pageList[index].id
                setPageId(pageList[index].id)
                try {
                    scrollContainer.current.scrollTo({
                        top: 0,
                        behavior: "instant",
                    });
                } catch (e) {
                }

            }
        }
    })

    useEffect(() => {
        tg.BackButton.hide();
        scrollContainer.current.scrollTo({
            top: lastScroll,
            behavior: "instant",
        });
    }, [])


    return (
        <div style={{display: 'grid', gridTemplateRows: '92vh 8vh', height: '100vh'}}>
            <div className={'scroll-container-y'} onScroll={(event) => {
                let scroll = event.target.scrollTop
                if (scroll > scrollCtrl + 200 && !hiddenSelector) {
                    scrollCtrl = scroll
                    setHiddenSelector(true)
                } else if ((scroll < scrollCtrl - 100 || scroll === 0) && hiddenSelector) {
                    scrollCtrl = scroll
                    setHiddenSelector(false)
                }
                if (hiddenSelector && scroll > scrollCtrl) {
                    scrollCtrl = scroll
                } else if (!hiddenSelector && scroll < scrollCtrl) {
                    scrollCtrl = scroll
                }
                lastScroll = scroll
            }} ref={scrollContainer}>
                <CatalogListHead/>
                <CatalogListBody/>
            </div>
            <NavigationBar/>
        </div>
    )
        ;
};

export default MainPage;