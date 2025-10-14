import React, {useEffect, useRef, useState} from 'react';
import {useServer} from "../useServer";
import Body from "./Body/Body";
import Head from "./Head/Head";


const EditCatalogs = ({page}) => {

    const [catalogHeadList, setCatalogHeadList] = useState([])
    const [catalogBodyList, setCatalogBodyList] = useState([])

    const {getStructureCatalogList} = useServer()


    useEffect(() => {
        getStructureCatalogList(page, 'head', setCatalogHeadList).then()
        getStructureCatalogList(page, 'body', setCatalogBodyList).then()
    }, [page]);


    return (<div style={{display: 'grid', gridTemplateColumns:'1fr 1fr'}}>
        <Head catalogHeadList={catalogHeadList} page={page} onReload={()=>{getStructureCatalogList(page, 'head', setCatalogHeadList).then()}}/>
        <Body catalogBodyList={catalogBodyList} page={page} onReload={()=>{getStructureCatalogList(page, 'body', setCatalogBodyList).then()}}/>
    </div>);


};

export default EditCatalogs;

