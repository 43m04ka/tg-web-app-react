import React, {useCallback} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {safeLink} from '../../shared/textPages/richText';
import {SECTION_TAGS, TAG_TITLES, dateTitle, textPageRoute} from '../../shared/textPages/textPageModel';
import {useTextPageList} from '../../shared/textPages/useTextPages';
import style from './TextPages.module.scss';

const SKELETONS = ['a', 'b', 'c', 'd', 'e', 'f'];

export default function TextPageCards({section, pageSize = 24}) {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();

    const tags = SECTION_TAGS[section] || [];
    const tag = tags.includes(params.get('tag')) ? params.get('tag') : '';

    const {items, status, hasMore, isLoadingMore, loadMore, reload} = useTextPageList({section, tag, pageSize});

    const pickTag = useCallback((next) => {
        setParams(next ? {tag: next} : {}, {replace: true});
    }, [setParams]);

    const isNews = section === 'news';

    return (
        <div className={style.listing}>
            {tags.length ? (
                <div className={style.chips}>
                    {['', ...tags].map((value) => (
                        <button
                            key={value || 'all'}
                            type="button"
                            className={value === tag ? `${style.chip} ${style.chipActive}` : style.chip}
                            onClick={() => pickTag(value)}
                        >
                            {value ? TAG_TITLES[value] : 'Все'}
                        </button>
                    ))}
                </div>
            ) : null}

            {status === 'error' ? (
                <EmptyState
                    tone="danger"
                    icon="⚠"
                    title="Не удалось загрузить"
                    text="Проверьте связь и попробуйте ещё раз."
                    actionLabel="Повторить"
                    onAction={reload}
                />
            ) : null}

            {status === 'loading' ? (
                <div className={style.cards}>
                    {SKELETONS.map((key) => <span key={key} className={`${style.card} ${style.cardSkeleton}`}/>)}
                </div>
            ) : null}

            {status !== 'loading' && status !== 'error' && items.length === 0 ? (
                <EmptyState icon="∅" title="Пока пусто" text="Здесь появятся материалы, как только мы их добавим."/>
            ) : null}

            {items.length ? (
                <div className={style.cards}>
                    {items.map((page, index) => {
                        const cover = safeLink(page.cover);
                        const date = isNews ? dateTitle(page.publishedAt) : '';

                        return (
                            <a
                                key={page.id}
                                className={style.card}
                                style={{'--i': Math.min(index % pageSize, 11)}}
                                href={textPageRoute(page)}
                                onClick={(event) => {
                                    event.preventDefault();
                                    navigate(textPageRoute(page));
                                }}
                            >
                                <span className={style.cardCover}>
                                    {cover ? <img src={cover} alt="" loading="lazy"/> : null}
                                </span>

                                <span className={style.cardBody}>
                                    <span className={style.cardMeta}>
                                        {TAG_TITLES[page.tag] ? <span className={style.tag}>{TAG_TITLES[page.tag]}</span> : null}
                                        {date ? <span className={style.date}>{date}</span> : null}
                                    </span>
                                    <span className={style.cardTitle}>{page.title}</span>
                                    {isNews && page.excerpt ? <span className={style.cardText}>{page.excerpt}</span> : null}
                                </span>
                            </a>
                        );
                    })}
                </div>
            ) : null}

            {hasMore && items.length ? (
                <button type="button" className={style.more} disabled={isLoadingMore} onClick={loadMore}>
                    {isLoadingMore ? 'Загружаем…' : 'Показать ещё'}
                </button>
            ) : null}
        </div>
    );
}
