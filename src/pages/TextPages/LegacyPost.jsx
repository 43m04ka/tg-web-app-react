import React from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {legacySlug, textPageRoute} from '../../shared/textPages/textPageModel';
import {useTextPage} from '../../shared/textPages/useTextPages';

export default function LegacyPost() {
    const {legacy} = useParams();
    const {page, status} = useTextPage(legacySlug(legacy));

    if (status === 'loading') return null;

    return <Navigate to={page ? textPageRoute(page) : '/news'} replace/>;
}
