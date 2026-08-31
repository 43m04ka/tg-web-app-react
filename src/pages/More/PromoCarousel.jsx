import React from 'react';
import {useCarouselTrack} from '../../shared/hooks/useCarouselTrack';
import {ExternalIcon} from './MoreIcons';
import style from './PromoCarousel.module.scss';

export default function PromoCarousel({items, onOpen}) {
    const {trackRef, active, handleScroll, scrollToSlide} = useCarouselTrack();

    if (!items?.length) return null;

    return (
        <section className={style.carousel} aria-label="Акции">
            <div className={style.track} ref={trackRef} onScroll={handleScroll}>
                {items.map((block) => (
                    <button key={block.id} type="button" className={style.slide}
                            onClick={() => onOpen(block.path)}>
                        <span className={style.head}>
                            <span className={style.title}>{block.name}</span>
                            <ExternalIcon className={style.arrow}/>
                        </span>
                        {block.body ? <span className={style.body}>{block.body}</span> : null}
                    </button>
                ))}
            </div>

            {items.length > 1 ? (
                <div className={style.dots}>
                    {items.map((block, index) => (
                        <button
                            key={block.id}
                            type="button"
                            className={`${style.dot} ${index === active ? style.dotActive : ''}`}
                            onClick={() => scrollToSlide(index)}
                            aria-label={block.name}
                            aria-current={index === active ? 'true' : undefined}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    );
}
