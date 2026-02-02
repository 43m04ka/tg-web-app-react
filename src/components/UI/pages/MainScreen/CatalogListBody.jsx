import React, {useEffect} from 'react';
import HomeBlock from "../other/HomeBlock";
import useGlobalData from "../../../../hooks/useGlobalData";
import {useTelegram} from "../../../../hooks/useTelegram";

const CatalogListBody = () => {
    const {tg} = useTelegram()
    const {catalogStructureList, pageId, mainPageCards, catalogList, updateBasket} = useGlobalData()

    if (catalogStructureList !== null && mainPageCards !== null && catalogList !== null) {

        const catalogStructureResultList = catalogStructureList.filter(item => item.structurePageId === pageId && item.group === 'body').sort((a, b) => {
            return a.serialNumber - b.serialNumber
        }).map((catalogStructure) => {
            catalogStructure.body = []
            if (typeof catalogStructure.path !== 'undefined' && catalogStructure.path !== null) {
                let catalogId = -1
                catalogList.forEach(catalog => {
                    if ((catalogStructure.path.replace('/catalog/', '')).replace('/choice-catalog/', '') === catalog.path) {
                        catalogId = catalog.id;
                    }
                });
                let cardArray = []

                mainPageCards.map(card => {
                    if (card.catalogId === catalogId) {
                        cardArray.push(card)
                    }
                })
                catalogStructure.body = cardArray
            }
            return catalogStructure
        })

        return (<div style={{marginBottom: String(window.innerWidth * 0.20 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px'}}>
                {catalogStructureResultList.map((catalogStructure) => {
                    return (<HomeBlock data={catalogStructure} lastIsBanner={catalogStructure.lastIsBanner}/>)
                })}
            </div>
        )
    } else {
        return (
            <div style={{paddingTop: '5px', paddingLeft: '7px', paddingRight: '7px', paddingBottom: '10px'}}>
                <div className={"title"} style={{
                    margin: '0',
                    background: '#373737',
                    width: '250px',
                    height: '18px',
                    borderRadius: '7px'
                }}/>
                <div className={"scroll-container"} style={{alignItems: 'center', overflow: "hidden"}}>
                    {[1, 2, 3].map(item => (
                            <div style={{marginRight: '5px'}}>
                                <div className={'list-element'}>
                                    <div className={'box-home-block-element'}>
                                        <div style={{
                                            background: '#373737',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'end',
                                            justifyContent: 'space-between',
                                            borderRadius: '10px'
                                        }} className={'img-home'}>
                                        </div>
                                        <div style={{height: '39px', overflow: 'hidden', lineHeight: '20px',}}>
                                            <div className={'text-element name-element'} style={{
                                                background: '#373737',
                                                height: '16px',
                                                width: '75px',
                                                borderRadius: '10px'
                                            }}></div>
                                        </div>
                                        <div style={{display: 'flex', justifyContent: 'left'}}>
                                            <div className={'text-element'} style={{
                                                background: '#373737',
                                                height: '16px',
                                                width: '125px',
                                                borderRadius: '10px',
                                                marginBottom: '0px'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>

                <div className={"homeBlock"}
                     style={{paddingBottom: '0px', paddingTop: '3px', marginTop: '30px'}}>
                    <div className={'img'} style={{
                        height: String((window.innerWidth) / 10 * 2) + 'px',
                        borderRadius: '15px',
                        background: "#373737",
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'end',
                        justifyContent: 'space-between',
                    }}></div>
                </div>
            </div>
        );
    }
};

export default CatalogListBody;