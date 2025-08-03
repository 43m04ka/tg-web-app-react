import React, {useRef, useState} from 'react';
import '../styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import {useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import useGlobalData from "../../hooks/useGlobalData";
import {useServerUser} from "../../hooks/useServerUser";
import ProductItem from "./ProductItem";

let lastScroll = 0
let scrollCtrl = 0
let listNumber = 1
let lastCardList = null
let len = 1
let onLoad = false

const ProductList = ({height}) => {

    const navigate = useNavigate();
    const {tg} = useTelegram()
    const {catalogList, counterBasket} = useGlobalData()
    const {getCardList} = useServerUser()

    const [hiddenSelector, setHiddenSelector] = useState(false);
    const [heightMenuButton, setHeightMenuButton] = useState(50);
    const [cardList, setCardList] = useState(lastCardList)
    const scrollRef = useRef();

    const setNewCardData = (data) => {
        setCardList([...(cardList || []), ...data.cardList])
        lastCardList = [...(cardList || []), ...data.cardList]
        listNumber += 1
        len = data.len
        onLoad = false;
    }


    const catalog = catalogList.map(catalog => {
        if (catalog.path === (window.location.pathname).replace('/catalog/', '')) {
            return catalog
        } else {
            return null
        }
    }).filter(item => item !== null)[0] || null

    useEffect(() => {
        tg.BackButton.show();
        try {
            scrollRef.current.scrollTo({
                top: lastScroll,
                behavior: "instant",
            });
        } catch (e) {
        }

        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }
    }, [scrollRef])

    if (catalog !== null) {
        if (cardList !== null) {
            return (
                <div className={'list'} style={{display: 'flex', flexDirection: 'column'}}>
                    <div className={'box-grid-panel'} style={{
                        height: String(heightMenuButton) + 'px',
                        overflow: 'hidden',
                        transitionProperty: 'height',
                        transitionDuration: '0.3s',
                        position: 'absolute',
                        background: '#171717',
                        width: String(window.innerWidth) + 'px',
                        borderBottom: '2px solid #454545',
                    }}>
                        <Link to={'/search-' + String(catalog.structurePageId)} className={'link-element'}>
                            <div className={'search'} style={{padding: '7px', display: 'flex', flexDirection: 'row'}}>
                                <div className={'background-search'} style={{width: '21px', height: '21px'}}></div>
                                <div style={{
                                    height: '20px',
                                    alignContent: 'center',
                                    marginLeft: '3px',
                                    fontSize: "14px",
                                    color: 'black',
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontVariant: 'small-caps'
                                }}>Найти игру, подписку...
                                </div>
                            </div>
                        </Link>
                        <Link to={'/basket-' + catalog.structurePageId} className={'link-element'}>
                            <div className={'div-button-panel'} style={{padding: '3px'}}>
                                <div className={'background-basket'} style={{width: '100%', height: '100%'}}>
                                    {counterBasket > 0 ? <div className={'text-element'} style={{
                                        background: '#f83d3d',
                                        fontSize: '9px',
                                        height: '16px',
                                        width: '16px',
                                        borderRadius: "50%",
                                        textAlign: 'center',
                                        lineHeight: '16px',
                                        position: 'absolute',
                                        marginLeft: '22px',
                                        marginTop: '22px'
                                    }}>{counterBasket}</div> : ''}
                                </div>
                            </div>
                        </Link>
                        <Link to={'/info'} className={'link-element'}>
                            <div className={'div-button-panel'} style={{padding: '6px'}}>
                                <div className={'background-profile'} style={{width: '100%', height: '100%'}}></div>
                            </div>
                        </Link>
                    </div>
                    <div className={'scroll-container-y'} ref={scrollRef}
                         onScroll={async (event) => {
                             let scroll = event.target.scrollTop
                             let scrollHeight = scrollRef.current.scrollHeight

                             if (listNumber < len && scroll + 2000 > scrollHeight && !onLoad) {
                                 onLoad = true
                                 getCardList(setNewCardData, catalog.id, listNumber + 1).then()
                             }

                             lastScroll = scroll
                             if (scroll > scrollCtrl + 200 && !hiddenSelector) {
                                 scrollCtrl = scroll
                                 setHiddenSelector(true)
                                 setHeightMenuButton(0)
                             } else if ((scroll < scrollCtrl - 100 || scroll === 0) && hiddenSelector) {
                                 scrollCtrl = scroll
                                 setHiddenSelector(false)
                                 setHeightMenuButton(50)
                             }
                             if (hiddenSelector && scroll > scrollCtrl) {
                                 scrollCtrl = scroll
                             } else if (!hiddenSelector && scroll < scrollCtrl) {
                                 scrollCtrl = scroll
                             }
                         }}
                         style={{
                             height: String(height - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                         }}>
                        <div style={{
                            height: String(45) + 'px'
                        }}>
                            <div style={{height: '300px', overflow: 'hidden'}}></div>
                        </div>
                        <div className={'list-grid'}>
                            {cardList.map(item => (
                                <div style={{marginLeft: String((window.innerWidth - 150 - 150) / 3) + 'px'}}>
                                    <ProductItem key={item.id} product={item}/></div>)
                            )}
                        </div>
                        <div style={{
                            position: 'absolute',
                            marginTop: String(heightMenuButton) + 'px',
                            transitionProperty: 'margin',
                            transitionDuration: '0.3s'
                        }}>
                            {/*<Filter height={height + 50 - heightMenuButton} elementKeys={elementKeys}*/}
                            {/*        onRequestFilter={onRequestFilter}/>*/}
                        </div>
                    </div>
                </div>
            );
        } else {
            getCardList(setNewCardData, catalog.id, 1).then()
            return (<div className={'plup-loader'} style={{
                marginTop: '10px',
                marginLeft: String(window.innerWidth / 2 - 50) + 'px'
            }}></div>)
        }
    }
};

export default ProductList;
