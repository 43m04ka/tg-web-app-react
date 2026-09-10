import React from 'react';
import {useLocation} from 'react-router-dom';
import Icon from './Icon';
import {HEADER_ACTIONS_ID, usePageHeaderValue} from './pageHeader';
import {moduleOfPath} from '../platform/registry';
import style from './ContextBar.module.scss';

const shortcutText = () => (navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K');

export default function ContextBar({onOpenPalette}) {
    const {pathname} = useLocation();
    const header = usePageHeaderValue();
    const module = moduleOfPath(pathname);
    const title = header.title && header.title !== module?.title ? header.title : '';

    return (
        <header className={style.bar}>
            <div className={style.crumbs}>
                <span className={style.module}>{module ? module.title : 'Админка'}</span>
                {title ? (
                    <>
                        <Icon name="chevron" size={13}/>
                        <span className={style.title}>{title}</span>
                    </>
                ) : null}
                {header.subtitle ? <span className={style.subtitle}>{header.subtitle}</span> : null}
            </div>

            <div className={style.tools}>
                <div id={HEADER_ACTIONS_ID} className={style.actions}/>

                <button type="button" className={style.search} onClick={onOpenPalette}>
                    <Icon name="search" size={14}/>
                    <span>Поиск и команды</span>
                    <kbd className={style.kbd}>{shortcutText()}</kbd>
                </button>
            </div>
        </header>
    );
}
