import React, {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import TextPageCards from '../../../pages/TextPages/TextPageCards';
import {SECTION_TITLES} from '../../../shared/textPages/textPageModel';
import Crumbs from '../../ui/Crumbs';
import style from '../../../pages/TextPages/TextPages.module.scss';

export default function DesktopTextList({section}) {
    const navigate = useNavigate();

    const trail = useMemo(() => [
        {key: 'home', label: 'Главная', onClick: () => navigate('/')},
        {key: 'current', label: SECTION_TITLES[section]}
    ], [navigate, section]);

    return (
        <div className={style.desktop}>
            <Crumbs trail={trail}/>

            <div className={style.head}>
                <h1 className={style.headTitle}>{SECTION_TITLES[section]}</h1>
            </div>

            <TextPageCards section={section}/>
        </div>
    );
}
