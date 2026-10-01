import React, {useMemo} from 'react';
import TextBlocks from '../../shared/textPages/TextBlocks';
import TextToc from '../../shared/textPages/TextToc';
import {MIN_TOC_ENTRIES, introLength, sectionsCount, sectionsTitle, tocEntries} from '../../shared/textPages/tocModel';
import {safeLink} from '../../shared/textPages/richText';
import {TAG_TITLES, dateTitle} from '../../shared/textPages/textPageModel';
import style from './TextPages.module.scss';

export default function TextPageView({page}) {
    const entries = useMemo(() => tocEntries(page?.blocks), [page]);

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
