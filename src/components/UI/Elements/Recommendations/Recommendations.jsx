import React, {useEffect, useState} from 'react';
import CatalogItem from "../../pages/Catalog/CatalogItem";
import {useServerUser} from "../../../../hooks/useServerUser";
import useGlobalData from "../../../../hooks/useGlobalData";

const Recommendations = ({from, horizontal}) => {

    const {getRecommendationsGames} = useServerUser()
    const {pageId} = useGlobalData()
    const [products, setProducts] = useState(null);

    useEffect(()=>{
        getRecommendationsGames(setProducts, pageId).then()
    }, [])


    if (products !== null) {
        return (
            <div>
                <div className={"title"}>Подобрали для Вас:</div>
                <div style={typeof horizontal === 'undefined' || horizontal !== true ?
                    {
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
                        paddingRight: '6vw'
                    }}>
                    {products.map(item => {
                        return (
                            <div
                                style={typeof horizontal === 'undefined' || horizontal !== true ? {marginLeft: '6vw'} : {marginLeft: '2vw'}}>
                                <CatalogItem key={item.id} product={item} from={from}/>
                            </div>)
                    })}
                </div>
            </div>
        );
    }
};

export default Recommendations;