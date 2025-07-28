import React, {useEffect, useRef, useState} from 'react';
import '../../../styles/style.css';
import {useTelegram} from "../../../../hooks/useTelegram";
import HeadSelector from "../../HeadSelector";
import CatalogListBody from "./CatalogListBody";
import CatalogListHead from "./CatalogListHead";

let scrollCtrl = 0;
let lastScroll = 0;

let lastPageId = 0

const MainPage = ({pageList}) => {
    const {tg} = useTelegram();
    const [size, setSize] = React.useState(window.innerHeight);
    const [hiddenSelector, setHiddenSelector] = useState(false);
    const scrollContainer = useRef();
    const [pageId, setPageId] = React.useState(lastPageId);

    pageList.map((item, index) => {
        if('/'+item.link===window.location.pathname){
            if(pageList[index].id !== pageId) {
                lastPageId = pageList[index].id
                setPageId(pageList[index].id)
                try {
                    scrollContainer.current.scrollTo({
                        top: 0,
                        behavior: "instant",
                    });
                }catch(e){}

            }
        }
    })

    const resizeHandler = () => {
        setSize(window.innerHeight);
    };

    useEffect(() => {
        tg.BackButton.hide();
        console.log(scrollContainer)
        scrollContainer.current.scrollTo({
            top: lastScroll,
            behavior: "instant",
        });
        window.addEventListener("resize", resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, [])


    return (
        <div>
            <HeadSelector pageList={pageList} hidden={hiddenSelector}/>

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
            }} ref={scrollContainer}
                 style={{
                     height: String(size - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top - 50) + 'px'
                 }}>
                <div style={{
                    height: '55px'
                }}>
                    <div style={{height: '300px', overflow: 'hidden'}}></div>
                </div>
                <div style={{width: '100%'}}>
                    <CatalogListHead/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <CatalogListBody/>
                </div>
            </div>
        </div>
    )
        ;
};

export default MainPage;