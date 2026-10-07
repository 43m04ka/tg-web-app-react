import React, {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {footerLinks} from '../../textPages/textPageModel';
import {useTextPageLinks} from '../../textPages/useTextPages';
import {SITE_CONTACTS, SOCIALS} from '../../lib/siteContacts';
import logo from '../../../desktop/assets/logo-full.png';
import style from './MobileFooter.module.scss';

const DOCUMENT_RE = /политик|соглашен|оферт|правов|cookie|персональн/i;

const STATIC_LINKS = [
    {key: 'faq', label: 'База знаний', to: '/faq'},
    {key: 'news', label: 'Новости', to: '/news'}
];

const MailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5"/>
        <path d="m4 7 8 6 8-6"/>
    </svg>
);

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 4 3 11l6 2.2M21 4l-3 16-9-6.8M21 4 9 13.2V19l3.2-3.6"/>
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
    </svg>
);

export default function MobileFooter() {
    const navigate = useNavigate();
    const textPages = useTextPageLinks();

    const {shop, documents} = useMemo(() => {
        const links = footerLinks(textPages);

        return {
            shop: [...links.filter((link) => !DOCUMENT_RE.test(link.label)), ...STATIC_LINKS],
            documents: links.filter((link) => DOCUMENT_RE.test(link.label))
        };
    }, [textPages]);

    const open = (event, to) => {
        event.preventDefault();
        navigate(to);
    };

    return (
        <footer className={style.footer}>
            <img className={style.logo} src={logo} alt="Геймворд"/>

            <div className={style.columns}>
                <nav className={style.column}>
                    <span className={style.heading}>Навигация по магазину</span>
                    {shop.map((link) => (
                        <a key={link.key} className={style.link} href={link.to} onClick={(event) => open(event, link.to)}>
                            {link.label}
                        </a>
                    ))}
                </nav>

                {documents.length ? (
                    <nav className={style.column}>
                        <span className={style.heading}>Документы</span>
                        {documents.map((link) => (
                            <a
                                key={link.key}
                                className={`${style.link} ${style.document}`}
                                href={link.to}
                                onClick={(event) => open(event, link.to)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                ) : null}
            </div>

            <div className={style.contacts}>
                <span className={style.heading}>Контакты</span>

                <a className={style.contact} href={`mailto:${SITE_CONTACTS.email}`}>
                    <span className={style.contactIcon}><MailIcon/></span>
                    {SITE_CONTACTS.email}
                </a>

                <a className={style.contact} href={SITE_CONTACTS.support.href} target="_blank" rel="noopener noreferrer">
                    <span className={style.contactIcon}><TelegramIcon/></span>
                    {SITE_CONTACTS.support.label}
                </a>

                <span className={style.contact}>
                    <span className={style.contactIcon}><ClockIcon/></span>
                    {SITE_CONTACTS.hours}
                </span>
            </div>

            <div className={style.socials}>
                {SOCIALS.map((item) => (
                    <a
                        key={item.label}
                        className={style.social}
                        href={item.href}
                        aria-label={item.label}
                        style={{'--brand': item.color}}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d={item.path} fill="currentColor"/>
                        </svg>
                    </a>
                ))}
            </div>

            <div className={style.legal}>
                <span>Все права принадлежат их правообладателям.</span>
                <span>2022–{new Date().getFullYear()} © {SITE_CONTACTS.brand}</span>
                <span>{SITE_CONTACTS.requisites}</span>
                <span>
                    По вопросам, жалобам и юридическим обращениям:{' '}
                    <a className={style.legalMail} href={`mailto:${SITE_CONTACTS.email}`}>{SITE_CONTACTS.email}</a>
                </span>
                <span className={style.disclaimer}>{SITE_CONTACTS.disclaimer}</span>
            </div>
        </footer>
    );
}
