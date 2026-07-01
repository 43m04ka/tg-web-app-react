import React, {useEffect, useState} from 'react';
import CatalogItem from "../../../pages/Catalog/CatalogItem";
import {useServerUser} from "../../../hooks/useServerUser";
import useGlobalData from "../../../hooks/useGlobalData";
import style from './Recommendations.module.scss';

const Recommendations = ({from, horizontal, data, desktopPanel, desktop}) => {
    const {getRecommendationsGames} = useServerUser();
    const {pageId, setBufferCardsRecommendations} = useGlobalData();
    const isControlled = typeof data !== 'undefined';
    const [fetched, setFetched] = useState(null);

    useEffect(() => {
        if (isControlled) return;
        getRecommendationsGames((res) => {
            setFetched(res);
            setBufferCardsRecommendations(res);
        }, pageId).then();
    }, [pageId, isControlled]);

    const products = isControlled ? data : fetched;

    if (desktopPanel) {
        if (!products || products.length === 0) return null;
        return (
            <div className={style['listPanel']}>
                {products.map((item) => (
                    <div key={item.id} className={style['panelCardWrap']}>
                        <CatalogItem product={item} from={from} isClicked={true} embedInGrid/>
                    </div>
                ))}
            </div>
        );
    }

    if (desktop) {
        return (
            <div className={style['desktopSection']}>
                {products && products.length > 0 && (
                    <>
                        <p className={style['desktopTitle']}>Подобрали для Вас:</p>
                        <div className={style['desktopGrid']}>
                            {products.map((item) => (
                                <div key={item.id} className={style['desktopCard']}>
                                    <CatalogItem product={item} from={from} embedInGrid/>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (products === null) return null;

    return (
        <div>
            <div className={"title"}>Подобрали для Вас:</div>
            <div
                style={typeof horizontal === 'undefined' || horizontal !== true ? {
                    display: 'grid',
                    width: '100%',
                    gridTemplateColumns: 'max-content max-content',
                    justifyItems: 'auto'
                } : {
                    display: 'flex',
                    flexDirection: 'row',
                    position: 'relative',
                    overflowX: 'scroll',
                    paddingLeft: '4vw',
                    paddingRight: '6vw',
                    minHeight: '54vw',
                }}
                className={style['list']}
            >
                {products.map((item) => (
                    <div
                        key={item.id}
                        style={typeof horizontal === 'undefined' || horizontal !== true ? {marginLeft: '6vw'} : {marginLeft: '2vw'}}
                    >
                        <CatalogItem product={item} from={from}/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
