import React from 'react';
import {Navigate} from 'react-router-dom';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import TextBlocks from '../../shared/textPages/TextBlocks';
import TextToc from '../../shared/textPages/TextToc';
import {MIN_TOC_ENTRIES, introLength, sectionsCount, sectionsTitle, tocEntries} from '../../shared/textPages/tocModel';
import {safeLink} from '../../shared/textPages/richText';
import {TAG_TITLES, dateTitle, textPageRoute} from '../../shared/textPages/textPageModel';
import {useTextPage} from '../../shared/textPages/useTextPages';
import style from './TextPages.module.scss';

const SKELETON_LINES = [92, 100, 84, 96, 70, 100, 88, 60];

export default function TextPageArticle({slug, section, onMissing, onLoaded}) {
    const {page, status, reload} = useTextPage(slug);

    const entries = React.useMemo(() => tocEntries(page?.blocks), [page]);

    React.useEffect(() => {
        if (page && onLoaded) onLoaded(page);
    }, [page, onLoaded]);

    if (status === 'loading') {
        return (
            <div className={style.article} aria-busy="true">
                <span className={`${style.skeleton} ${style.skeletonTitle}`}/>
                {SKELETON_LINES.map((width, index) => (
                    <span key={index} className={style.skeleton} style={{width: `${width}%`}}/>
                ))}
            </div>
        );
    }

    if (status === 'error') {
        return (
            <EmptyState
                tone="danger"
                icon="⚠"
                title="Не удалось загрузить"
                text="Проверьте связь и попробуйте ещё раз."
                actionLabel="Повторить"
                onAction={reload}
            />
        );
    }

    if (status === 'missing') {
        return (
            <EmptyState
                icon="?"
                title="Страница не найдена"
                text="Возможно, её переименовали или сняли с публикации."
                actionLabel="На главную"
                onAction={onMissing}
            />
        );
    }

    if (section && page.section !== section) return <Navigate to={textPageRoute(page)} replace/>;

    const date = page.section === 'news' ? dateTitle(page.publishedAt) : '';
    const tag = TAG_TITLES[page.tag] || '';
    const cover = page.section === 'news' ? safeLink(page.cover) : '';

    if (entries.length < MIN_TOC_ENTRIES) {
        return (
            <article className={style.article}>
                {tag || date ? (
                    <div className={style.meta}>
                        {tag ? <span className={style.tag}>{tag}</span> : null}
                        {date ? <time className={style.date} dateTime={page.publishedAt}>{date}</time> : null}
                    </div>
                ) : null}

                <h1 className={style.title}>{page.title}</h1>

                {cover ? <img className={style.cover} src={cover} alt=""/> : null}

                <TextBlocks blocks={page.blocks}/>
            </article>
        );
    }

    const edition = page.section === 'news' ? '' : dateTitle(page.publishedAt || page.updatedAt);
    const intro = introLength(page.blocks, entries);

    return (
        <article className={`${style.article} ${style.withToc}`}>
            {tag ? (
                <div className={style.meta}>
                    <span className={style.tag}>{tag}</span>
                </div>
            ) : null}

            <h1 className={style.title}>{page.title}</h1>

            <div className={style.facts}>
                {date ? <time className={style.fact} dateTime={page.publishedAt}>{date}</time> : null}
                {edition ? <span className={style.fact}>Редакция от {edition}</span> : null}
                <span className={style.fact}>{sectionsTitle(sectionsCount(entries))}</span>
            </div>

            {cover ? <img className={style.cover} src={cover} alt=""/> : null}

            {intro > 0 ? <div className={style.intro}><TextBlocks blocks={page.blocks} to={intro}/></div> : null}

            <div className={style.tocLayout}>
                <aside className={style.tocSide}>
                    <TextToc entries={entries}/>
                </aside>

                <TextBlocks blocks={page.blocks} from={intro} anchors={entries}/>
            </div>
        </article>
    );
}
