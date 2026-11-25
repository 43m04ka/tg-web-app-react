import React from 'react';
import {formatPrice} from '../../../pages/Main/catalogSections';
import {isSellable} from '../../../pages/Services/servicesModel';
import {useCodeCatalog} from '../../../pages/Services/useCodeCatalog';
import {Reveal} from '../../shell/useReveal';
import style from './HomeSections.module.scss';

export function PreorderSection({item, onOpen}) {
    if (!item) return null;
    return (
        <Reveal as="section" className={style.preorder} aria-label="GTA VI">
            <img className={style.art} src={item.image || item.cover} alt="" loading="lazy"/>
            <div className={style.preorderBody}>
                <span className={style.eyebrow}>{item.subtitle || 'Grand Theft Auto'}</span>
                <h2>{item.title}</h2>
                {item.note ? <p>{item.note}</p> : null}
                <div className={style.buyRow}>
                    {item.price ? <strong>{formatPrice(item.price)}</strong> : null}
                    <button type="button" className={style.primary} onClick={() => onOpen(item)}>Подробнее о предзаказе <span aria-hidden="true">↗</span></button>
                </div>
            </div>
        </Reveal>
    );
}

export function HomeServices({onOpen}) {
    const {brands} = useCodeCatalog();
    const visible = (brands || []).filter((brand) => !brand.isHidden && brand.offers?.some(isSellable)).slice(0, 6);
    if (!visible.length) return null;
    return (
        <Reveal as="section" className={style.services}>
            <header><h2>Сервисы</h2><button type="button" onClick={() => onOpen(null)}>Все сервисы <span aria-hidden="true">→</span></button></header>
            <div className={style.serviceGrid}>
                {visible.map((brand) => (
                    <button type="button" className={style.service} key={brand.id} onClick={() => onOpen(brand.id)}>
                        {brand.image || brand.icon ? <img src={brand.image || brand.icon} alt="" loading="lazy"/> : <span className={style.initial} aria-hidden="true">{brand.name?.slice(0, 1)}</span>}
                        <strong>{brand.name}</strong><span className={style.arrow} aria-hidden="true">↗</span>
                    </button>
                ))}
            </div>
        </Reveal>
    );
}
