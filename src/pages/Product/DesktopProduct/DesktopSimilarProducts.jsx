import React, {useEffect, useState} from 'react';
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import CatalogItem from "../../Catalog/CatalogItem";
import useGlobalData from "../../../hooks/useGlobalData";
import {useServerUser} from "../../../hooks/useServerUser";
import style from "./DesktopSimilarProducts.module.scss";

const DesktopSimilarProducts = ({minRating, productData}) => {
    const {pageId} = useGlobalData();
    const {getCardList, getSearch} = useServerUser();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (productData.conceptProducts === null && productData.conceptAddOns === null) {
            getSearch((result) => {
                setProducts(result.filter((item) => item.rating >= minRating && item.id !== productData.id));
            }, productData.name, pageId, {sorting: 'default', platform: [], language: [], numberPlayers: [], genre: [], type: []}).then();
            return;
        }

        if (productData.genre) {
            getCardList((data) => {
                const usedServiceIds = productData.conceptProducts?.map((item) => item.serviceId) || [];
                setProducts(data.cardList.filter((item) => item.id !== productData.id && !usedServiceIds.includes(item.serviceId)));
            }, productData.catalogId, 1, {sorting: 'default', platform: [], language: [], numberPlayers: [], genre: [productData.genre], type: ['GAME']}).then();
        }
    }, [getCardList, getSearch, minRating, pageId, productData]);

    if (!products.length) return null;

    return (
        <section className={style.card}>
            <h2 className={style.title}>Похожее</h2>
            <Swiper className={style.list} slidesPerView="auto" spaceBetween={16}>
                {products.map((item) => (
                    <SwiperSlide key={item.id} className={style.item}>
                        <CatalogItem product={item} embedInGrid/>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default DesktopSimilarProducts;
