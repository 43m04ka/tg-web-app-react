import React, {useEffect, useState} from 'react';
import {useServer} from "../../../../hooks/useServer";
import HomeBlock from "../../HomeBlock";
import useGlobalData from "../../../../hooks/useGlobalData";
import ProductItem from "../../ProductItem";
import {Link} from "react-router-dom";

const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'


let lastPageID = -1
const CatalogListBody = ({}) => {
    const {catalogStructureList, pageId, mainPageCards, catalogList} = useGlobalData()

    if (catalogStructureList.length > 0 && mainPageCards.length > 0) {
        return (<div>
                {catalogStructureList.filter(item => item.structurePageId === pageId && item.group === 'body').sort((a, b) => {
                    return a.serialNumber - b.serialNumber
                }).map((catalogStructure) => {
                    catalogStructure.body = []
                    if (typeof catalogStructure.path !== 'undefined' && catalogStructure.path !== null) {
                        let catalogId = -1
                        catalogList.forEach(catalog => {
                            if (catalogStructure.path.includes(catalog.path)) {
                                catalogId = catalog.id;
                            }
                        });
                        console.log(catalogId)
                        let cardArray = []
                        mainPageCards.map(card => {
                            if (card.catalogId === catalogId) {
                                cardArray.push(card)
                            }
                        })
                        catalogStructure.body = cardArray
                    }
                    return (<HomeBlock data={catalogStructure}/>)
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