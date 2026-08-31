import React from 'react';
import style from './Product.module.scss';

export default function ProductSpecs({specs}) {
    if (specs.length === 0) return null;

    return (
        <section className={style.section}>
            <h2 className={style.sectionTitle}>Характеристики</h2>

            <div className={style.specs}>
                {specs.map((row) => (
                    <div key={row.label} className={style.spec}>
                        <span className={style.specLabel}>{row.label}</span>
                        <span className={style.specValue}>{row.value}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
