import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import TextPageArticle from '../../../pages/TextPages/TextPageArticle';
import {SECTION_ROUTES, SECTION_TITLES} from '../../../shared/textPages/textPageModel';
import {hasToc} from '../../../shared/textPages/tocModel';
import Crumbs from '../../ui/Crumbs';
import style from '../../../pages/TextPages/TextPages.module.scss';

export default function DesktopTextPage({section}) {
    const navigate = useNavigate();
    const {slug} = useParams();

    const [title, setTitle] = useState('');
    const [wide, setWide] = useState(false);

    const openHome = useCallback(() => navigate('/'), [navigate]);
    const onLoaded = useCallback((page) => {
        setTitle(page.title);
        setWide(hasToc(page.blocks));
    }, []);

    const trail = useMemo(() => [
        {key: 'home', label: 'Главная', onClick: openHome},
        SECTION_TITLES[section]
            ? {key: 'section', label: SECTION_TITLES[section], onClick: () => navigate(SECTION_ROUTES[section])}
            : null,
        {key: 'current', label: title || '…'}
    ].filter(Boolean), [navigate, openHome, section, title]);

    return (
        <div className={`${style.desktop} ${wide ? style.desktopWide : style.desktopNarrow}`}>
            <Crumbs trail={trail}/>

            <div className={style.sheet}>
                <TextPageArticle key={slug} slug={slug} section={section} onMissing={openHome} onLoaded={onLoaded}/>
            </div>
        </div>
    );
}
