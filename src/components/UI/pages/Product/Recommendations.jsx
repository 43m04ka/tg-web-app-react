import React, {useEffect, useState} from 'react';
import CatalogItem from "../Catalog/CatalogItem";
import {useServerUser} from "../../../../hooks/useServerUser";
import useGlobalData from "../../../../hooks/useGlobalData";

const Recommendations = () => {

    const {getRecommendationsGames} = useServerUser()
    const {pageId} = useGlobalData()
    const [products, setProducts] = useState(null);

    useEffect(() => {
        getRecommendationsGames(setProducts, pageId).then()
    }, [])

    if(products !== null) {
        return (
            <div>
                <div className={"title"}>Рекомендуем:</div>
                <div className={'list-grid'}>
                    {products.map(item => {
                        return (
                            <div style={{marginLeft: String((window.innerWidth - 150 - 150) / 3) + 'px'}}>
                                <CatalogItem key={item.id} product={item}/>
                            </div>)
                    })}
                </div>
            </div>
        );
    }
};

export default Recommendations;