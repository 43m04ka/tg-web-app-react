import React from 'react';
import {SOCIALS} from '../../shared/lib/siteContacts';
import avito from '../../shared/assets/marketplaces/avito.png';
import style from './Reviews.module.scss';

const marks = {vk: SOCIALS.find((item) => item.label === 'ВКонтакте'), tg: SOCIALS.find((item) => item.label === 'Telegram')};

export default function ReviewSourceIcon({platform}) {
    const mark = marks[platform] || marks.vk;
    return <span className={style.sourceIcon} data-platform={platform} style={{color: mark.color, backgroundColor: platform === 'avito' ? '#fff' : mark.color}} aria-hidden="true">
        {platform === 'avito' ? <img src={avito} alt=""/> : <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill="#fff"/><path d={mark.path} fill="currentColor"/></svg>}
    </span>;
}
