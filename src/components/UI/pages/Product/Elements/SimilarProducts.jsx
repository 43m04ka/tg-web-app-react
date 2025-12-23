import React, {useEffect, useState} from 'react';
import useGlobalData from "../../../../../hooks/useGlobalData";
import style from "../Product.module.scss";
import CatalogItem from "../../Catalog/CatalogItem";
import {useServer} from "../useServer";

const SimilarProducts = ({name, minRating}) => {
    const {getSearch}=  useServer()
    const {pageId} = useGlobalData()
    const [products, setProducts] = useState(null);

    useEffect(() => {
        getSearch((result) => {setProducts(result.filter((item, index) => item.rating >= minRating && index !== 0))}, name, pageId).then()
    }, [])

    if(products !== null && products.length > 0) {
        return (
            <div>
                <div className={"title"}>Похожее:</div>
                <div style={{display: 'flex', flexDirection:'row', position: 'relative', overflowX:'scroll', paddingLeft:'4vw', paddingRight:'6vw'}}>
                    {products.map(item => {
                        return (
                            <div style={{marginLeft: '2vw'}}>
                                <CatalogItem key={item.id} product={item}/>
                            </div>)
                    })}
                </div>
            </div>
        );
    }
};

export default SimilarProducts;