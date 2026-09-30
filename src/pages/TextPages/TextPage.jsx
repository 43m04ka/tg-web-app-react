import React, {useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {SECTION_TITLES} from '../../shared/textPages/textPageModel';
import PageHeader from '../Account/PageHeader';
import TextPageArticle from './TextPageArticle';
import style from './TextPages.module.scss';

export default function TextPage({section}) {
    const navigate = useNavigate();
    const {slug} = useParams();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const openHome = useCallback(() => navigate('/'), [navigate]);

    return (
        <div
            className={style.mobile}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 28 * var(--u))`
            }}
        >
            <PageHeader title={SECTION_TITLES[section] || 'Информация'} fallback="/"/>
            <TextPageArticle key={slug} slug={slug} section={section} onMissing={openHome}/>
        </div>
    );
}
