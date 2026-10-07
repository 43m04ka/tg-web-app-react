import React, {useCallback, useContext, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {footerLinks} from '../../shared/textPages/textPageModel';
import {useTextPageLinks} from '../../shared/textPages/useTextPages';
import {ScrollAreaContext} from './ScrollAreaContext';
import {useSiteMenu} from './useSiteMenu';
import {menuTarget} from '../model/menuModel';
import {SITE_CONTACTS, SOCIALS} from '../../shared/lib/siteContacts';
import logo from '../assets/logo-full.png';
import paymentLogos from '../assets/payment-logos.png';
import style from './SiteFooter.module.scss';


const external = (href) => (/^https?:/.test(href) ? {target: '_blank', rel: 'noopener noreferrer'} : {});

export default function SiteFooter() {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const areaRef = useContext(ScrollAreaContext);
    const {groups, select} = useSiteMenu();
    const textPages = useTextPageLinks();

    const legalLinks = useMemo(() => footerLinks(textPages), [textPages]);

    const openPage = useCallback((event, link) => {
        event.preventDefault();

        if (link.to === pathname) areaRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
        else navigate(link.to);
    }, [areaRef, navigate, pathname]);

    return (
        <footer className={style.footer}>
            <div className={style.inner}>
                <div className={style.top}>
                    <div className={style.about}>
                        <img className={style.logo} src={logo} alt="Геймворд"/>

                        <a className={style.mail} href={`mailto:${SITE_CONTACTS.email}`}>{SITE_CONTACTS.email}</a>

                        <p className={style.text}>
                            Прием заказов осуществляется круглосуточно. Активация и обработка заказов осуществляется с 10:00 до 22:00 по МСК ежедневно.
                        </p>

                        <div className={style.socials}>
                            {SOCIALS.map((item) => (
                                <a
                                    key={item.label}
                                    className={style.social}
                                    href={item.href}
                                    aria-label={item.label}
                                    style={{'--brand': item.color}}
                                    {...external(item.href)}
                                >
                                    <svg className={style.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                                        <path d={item.path} fill="currentColor"/>
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    <nav className={style.columns}>
                        {groups.map((group) => (
                            <div key={group.key} className={style.column}>
                                <span className={style.heading}>{group.title}</span>
                                {group.items.filter((item) => !item.extra).map((item) => (
                                    <a
                                        key={item.key}
                                        className={style.link}
                                        href={menuTarget(item)}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            select(item);
                                        }}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                        ))}
                    </nav>
                </div>

                <div className={style.bottom}>
                    <div className={style.legal}>
                        <span>2022–{new Date().getFullYear()} © {SITE_CONTACTS.brand}</span>
                        <span>{SITE_CONTACTS.requisites}</span>
                        {legalLinks.length ? (
                            <span className={style.legalLinks}>
                                {legalLinks.map((link) => (
                                    <a
                                        key={link.key}
                                        className={style.legalLink}
                                        href={link.to}
                                        onClick={(event) => openPage(event, link)}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </span>
                        ) : null}
                        <span>
                            Данный сайт не является официальным сайтом PlayStation, Xbox, Netflix, Spotify, Apple, Steam, YouTube.
                            Все упомянутые товарные знаки, логотипы, названия игр и компаний, а также материалы являются
                            собственностью соответствующих владельцев.
                        </span>
                    </div>

                    <img
                        className={style.payments}
                        src={paymentLogos}
                        alt="МИР, СБП, VISA, Mastercard, PayKeeper"
                    />
                </div>
            </div>
        </footer>
    );
}
