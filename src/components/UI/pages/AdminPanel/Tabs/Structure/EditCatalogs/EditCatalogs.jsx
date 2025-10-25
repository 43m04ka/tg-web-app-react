import React, {useEffect, useRef, useState} from 'react';
import {useServer} from "../useServer";
import Body from "./Body/Body";
import Head from "./Head/Head";
import ButtonLine from "../../../Elements/ButtonLine/ButtonLine";
import useGlobalData from "../../../../../../../hooks/useGlobalData";


const EditCatalogs = () => {

    const {pageList} = useGlobalData()

    const [page, setPage] = useState(-1);

    const [catalogHeadList, setCatalogHeadList] = useState([])
    const [catalogBodyList, setCatalogBodyList] = useState([])

    const {getStructureCatalogList} = useServer()


    useEffect(() => {
        getStructureCatalogList(page, 'head', setCatalogHeadList).then()
        getStructureCatalogList(page, 'body', setCatalogBodyList).then()
    }, [page]);


    return (<div style={{display: 'grid', gridTemplateRows: '50px 1fr 1fr', height: '100vp', width: '100%'}}>
        <div style={{width:'max-content', alignSelf: 'center', marginLeft:'30px'}}>
            <ButtonLine listButtonData={pageList.map(el => {
                return {name: el.titleForMessage, status: true, key: el.id}
            })} returnOptions={(option)=>{setPage(option)}}/>
        </div>
        <Head catalogHeadList={catalogHeadList} page={page} onReload={() => {
            getStructureCatalogList(page, 'head', setCatalogHeadList).then()
        }}/>
        <Body catalogBodyList={catalogBodyList} page={page} onReload={() => {
            getStructureCatalogList(page, 'body', setCatalogBodyList).then()
        }}/>
    </div>);


};

export default EditCatalogs;

