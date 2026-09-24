import React from 'react';
import logo from '../assets/logo.png';
import style from './SiteFooter.module.scss';

const COLUMNS = [
    {
        title: 'Магазин',
        links: [
            {label: 'Игры для PlayStation и Xbox', href: 'https://t.me/gwstore_bot'},
            {label: 'PS Plus', href: 'https://gwstore.su/playstation_sub'},
            {label: 'Game Pass', href: 'https://gwstore.su/xbox_sub'},
            {label: 'Новости', href: 'https://vk.com/gwstore.news'},
            {label: 'Приложение в Telegram', href: 'https://t.me/gwstore_bot'}
        ]
    },
    {
        title: 'Покупателям',
        links: [
            {label: 'FAQ', href: 'https://gwstore.su/faq'},
            {label: 'Контакты', href: 'https://gwstore.su/contact'},
            {label: 'Оплата и доставка', href: 'https://gwstore.su/payment'},
            {label: 'Политика конфиденциальности', href: 'https://gwstore.su/pk'},
            {label: 'Правовая информация', href: 'https://gwstore.su/privacy'}
        ]
    },
    {
        title: 'Связь',
        links: [
            {label: '8 906 579 9797', href: 'tel:+79065799797'},
            {label: 'WhatsApp', href: 'https://wa.me/message/X32YKLA4RINTA1'},
            {label: 'Telegram', href: 'https://t.me/gwstore_admin'},
            {label: 'gwstore@bk.ru', href: 'mailto:gwstore@bk.ru'}
        ]
    }
];

const SOCIALS = [
    {label: 'Telegram', short: 'TG', href: 'https://t.me/gwstore_admin'},
    {label: 'ВКонтакте', short: 'VK', href: 'https://vk.com/gwstore.news'},
    {label: 'WhatsApp', short: 'WA', href: 'https://wa.me/message/X32YKLA4RINTA1'}
];

const PAYMENTS = ['МИР', 'СБП', 'VISA', 'Mastercard'];

const external = (href) => (/^https?:/.test(href) ? {target: '_blank', rel: 'noopener noreferrer'} : {});

export default function SiteFooter() {
    return (
        <footer className={style.footer}>
            <div className={style.inner}>
                <div className={style.top}>
                    <div className={style.about}>
                        <div className={style.logo}>
                            <span className={style.mark} style={{'--logo': `url(${logo})`}} aria-hidden="true"/>
                            <span className={style.brand}>Геймворд</span>
                        </div>

                        <p className={style.tagline}>Игровой дискаунтер</p>

                        <a className={style.mail} href="mailto:gwstore@bk.ru">gwstore@bk.ru</a>

                        <p className={style.text}>
                            Приём заказов круглосуточно.
                            <br/>
                            Активация и обработка заказов с 10:00 до 22:00 по Мск ежедневно
                        </p>

                        <div className={style.socials}>
                            {SOCIALS.map((item) => (
                                <a
                                    key={item.label}
                                    className={style.social}
                                    href={item.href}
                                    aria-label={item.label}
                                    {...external(item.href)}
                                >
                                    {item.short}
                                </a>
                            ))}
                        </div>
                    </div>

                    <nav className={style.columns}>
                        {COLUMNS.map((column) => (
                            <div key={column.title} className={style.column}>
                                <span className={style.heading}>{column.title}</span>
                                {column.links.map((link) => (
                                    <a
                                        key={link.label}
                                        className={style.link}
                                        href={link.href}
                                        {...external(link.href)}
                                    >
                                        {link.label}
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
                        <span>
                            Данный сайт не является официальным сайтом PlayStation, Xbox, Netflix, Spotify, Apple, Steam, YouTube.
                            Все упомянутые товарные знаки, логотипы, названия игр и компаний, а также материалы являются
                            собственностью соответствующих владельцев.
                        </span>
                    </div>

                    <div className={style.payments}>
                        {PAYMENTS.map((item) => (
                            <span key={item} className={style.payment}>{item}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
