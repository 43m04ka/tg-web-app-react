import React, {useCallback, useContext, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {footerLinks} from '../../shared/textPages/textPageModel';
import {useTextPageLinks} from '../../shared/textPages/useTextPages';
import {ScrollAreaContext} from './ScrollAreaContext';
import {useSiteMenu} from './useSiteMenu';
import {menuTarget} from '../model/menuModel';
import logo from '../assets/logo-full.png';
import paymentLogos from '../assets/payment-logos.png';
import style from './SiteFooter.module.scss';

const SOCIALS = [
    {label: 'ВКонтакте', color: '#0077ff', href: 'https://vk.ru/gwstoreru', path: 'm9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z'},
    {label: 'Telegram', color: '#26a5e4', href: 'https://t.me/gwstoreru', path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'},
    {label: 'WhatsApp', color: '#25d366', href: 'https://api.whatsapp.com/message/X32YKLA4RINTA1?autoload=1&app_absent=0', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'},
    {label: 'YouTube', color: '#ff0000', href: 'https://www.youtube.com/@gameword.russia', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'},
    {label: 'Max', color: '#7b5cff', href: 'https://max.ru/gwstore_playstation', path: 'M12 2a10 10 0 1 1-4.9 18.72L3 22l1.28-4.1A10 10 0 0 1 12 2Zm0 4.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z'}
];

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

                        <a className={style.mail} href="mailto:gwstore@bk.ru">gwstore@bk.ru</a>

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
                        <span>2022–{new Date().getFullYear()} © Геймворд | Игровой дискаунтер</span>
                        <span>ИНН 443000695996, ОГРНИП 323440000002525</span>
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
