import React from 'react';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {SECTION_TITLES} from '../../shared/textPages/textPageModel';
import PageHeader from '../Account/PageHeader';
import TextPageCards from './TextPageCards';
import style from './TextPages.module.scss';

export default function TextList({section}) {
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    return (
        <div
            className={style.mobile}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 28 * var(--u))`
            }}
        >
            <PageHeader title={SECTION_TITLES[section]} fallback="/"/>
            <TextPageCards section={section}/>
        </div>
    );
}
