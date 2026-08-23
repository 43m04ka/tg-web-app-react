import React from 'react';
import ProductCard from './ProductCard';
import {cleanPath, isBannerBlock} from './catalogSections';
import style from './CatalogSection.module.scss';

const PREVIEW_LIMIT = 6;

export default function CatalogSection({section, onOpenCatalog, onOpenProduct}) {
    const {block, path, products} = section;

    if (isBannerBlock(block)) {
        const clickable = block.type === 'banner-clickable';

        return (
            <div
                className={`${style.banner} ${clickable ? style.bannerClickable : ''}`}
                style={{
                    ...(block.backgroundColor && block.backgroundColor !== 'none'
                        ? {backgroundColor: block.backgroundColor}
                        : null),
                    ...(block.url ? {backgroundImage: `url(${block.url})`} : null)
                }}
                onClick={clickable ? () => onOpenCatalog(cleanPath(block.path)) : undefined}
                role={clickable ? 'button' : undefined}
                aria-label={clickable ? block.name || 'Баннер' : undefined}
            />
        );
    }

    return (
        <section className={style.section}>
            <div className={style.head}>
                {block.imageIcon ? (
                    <span className={style.icon} style={{backgroundImage: `url(${block.imageIcon})`}} aria-hidden="true"/>
                ) : null}
                <h2 className={style.title}>{block.name}</h2>
            </div>

            <div className={style.row}>
                {products.slice(0, PREVIEW_LIMIT).map((product) => (
                    <ProductCard key={product.id} product={product} onOpen={onOpenProduct}/>
                ))}
            </div>

            <div className={style.footer}>
                <button type="button" className={style.open} onClick={() => onOpenCatalog(path)}>
                    Открыть каталог
                </button>
            </div>
        </section>
    );
}
