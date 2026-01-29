import React, {useEffect, useState} from 'react';
import useGlobalData from "../../../../../hooks/useGlobalData";
import style from "../Product.module.scss";
import CatalogItem from "../../Catalog/CatalogItem";
import {useServer} from "../useServer";
import {useServerUser} from "../../../../../hooks/useServerUser";

const SimilarProducts = ({minRating, productData}) => {
    const {getSearch}=  useServer()
    const {pageId} = useGlobalData()
    const [products, setProducts] = useState(null);
    const {getCardList} = useServerUser()

    const setNewCardData = (data, number) => {
        setProducts(data.cardList.filter(item => item.id !== productData.id && !(item.serviceId in productData.conceptProducts)))
    }

    useEffect(() => {
        if(productData.conceptProducts === null && productData.conceptAddOns === null) {
            getSearch((result) => {
                setProducts(result.filter(item => item.rating >= minRating && item.id !== productData.id))
            }, productData.name, pageId).then()
        }else if(typeof productData.genre !== 'undefined' && productData.genre !== null){
            getCardList(setNewCardData, productData.catalogId, 1, {sorting: 'default', platform: [], language: [], numberPlayers: [], genre:[productData.genre], type:['GAME']}).then()
        }
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