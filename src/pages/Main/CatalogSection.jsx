import React from 'react';
import ProductCard from './ProductCard';
import {isBannerBlock} from './catalogSections';
import style from './CatalogSection.module.scss';

const PREVIEW_LIMIT = 6;

export default function CatalogSection({section, onOpenCatalog, onOpenProduct}) {
    const {block, path, products} = section;

    if (isBannerBlock(block)) {
        const clickable = block.type === 'banner-clickable';

        return (
            <div
                className={`${style.banner} ${clickable ? style.bannerClickable : ''}`}
                style={block.backgroundColor && block.backgroundColor !== 'none'
                    ? {background: block.backgroundColor}
                    : undefined}
                onClick={clickable ? () => onOpenCatalog(block.path) : undefined}
            >
                {block.url ? <img className={style.bannerImage} src={block.url} alt={block.name || ''}/> : null}
            </div>
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
