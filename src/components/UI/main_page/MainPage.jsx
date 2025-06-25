import React, {useCallback, useEffect, useRef, useState} from 'react';
import '../../styles/style.css';
import {useTelegram} from "../../../hooks/useTelegram";
import HeadSelector from "../HeadSelector";
import Slider from "../SliderPic";
import MP_Catalogs from "./MP_Catalogs";
import SliderPic from "../SliderPic";

let scrollCtrl = 0;
let lastScroll = 0;

const MainPage = ({pageList}) => {

    const {tg, user} = useTelegram();
    const [size, setSize] = React.useState(window.innerHeight);
    const [hiddenSelector, setHiddenSelector] = useState(false);
    const scrollContainer = useRef();

    let pageId = -1
    pageList.map((item, index) => {
        if('/'+item.link===window.location.pathname){
            pageId = pageList[index].id
        }
    })

    const resizeHandler = () => {
        setSize(window.innerHeight);
    };

    useEffect(() => {
        tg.BackButton.hide();
        // scrollContainer.current.translate = false;
        // scrollContainer.current.scrollTop = lastScroll;
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
                <div style={{width: String(window.innerWidth) + 'px'}}>
                    <SliderPic pageId = {pageId}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <MP_Catalogs/>
                </div>
            </div>
        </div>
    )
        ;
};

export default MainPage;