import React, {useMemo, useState} from 'react';
import CatalogItem from "../../Catalog/CatalogItem";
import {getParameterValue} from "./productDesktopUtils";
import style from "./DesktopDescription.module.scss";

const DesktopDescription = ({parameters, productData}) => {
    const [mode, setMode] = useState(1);

    const tabs = useMemo(() => ([
        {id: 1, label: 'Характеристики', visible: true},
        {id: 2, label: 'Издания', visible: productData.conceptProducts?.length > 0},
        {id: 3, label: 'Донат и дополнения', visible: productData.conceptAddOns?.length > 0},
    ]).filter((item) => item.visible), [productData]);

    return (
        <section className={style.card}>
            <div className={style.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={mode === tab.id ? style.tabActive : style.tab}
                        onClick={() => setMode(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {mode === 1 && (
                <div className={style.content}>
                    {parameters.map((parameter) => {
                        const value = getParameterValue(parameter, productData);
                        if (value === null || value === '') return null;

                        return (
                            <div key={parameter.label} className={style.parameterRow}>
                                <span className={style.parameterLabel}>{parameter.label}</span>
                                <span className={style.parameterValue}>{value}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {mode === 2 && (
                <div className={style.catalogRow}>
                    {productData.conceptProducts.map((item) => (
                        <div key={item.id} className={style.catalogCard}>
                            <CatalogItem product={item} embedInGrid/>
                        </div>
                    ))}
                </div>
            )}

            {mode === 3 && (
                <div className={style.catalogRow}>
                    {productData.conceptAddOns.map((item) => (
                        <div key={item.id} className={style.catalogCard}>
                            <CatalogItem product={item} embedInGrid/>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default DesktopDescription;
