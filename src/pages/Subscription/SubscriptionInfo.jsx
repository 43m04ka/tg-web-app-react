import React from 'react';
import style from './Subscription.module.scss';

const PS_BRANDS = ['psplus', 'eaplay', 'ubisoft', 'gtaplus'];

const IMPORTANT = [
    'Если нет своего иностранного аккаунта — подарим при любой покупке. Новый аккаунт будет только в вашем распоряжении, все данные можно сменить.',
    'Активация подписки или игры происходит через вход в аккаунт. Для входа потребуются данные — логин, пароль и резервные коды для входа.'
];

const ABOUT = [
    {name: 'PS Plus Essential', text: 'доступ к онлайну в играх, которые у вас на дисках или куплены на аккаунт, и 3 бесплатные игры каждый месяц.'},
    {name: 'PS Plus Extra', text: 'преимущества Essential и основной каталог из ≈400 бесплатных игр.'},
    {name: 'PS Plus Deluxe', text: 'преимущества Essential и Extra, а ещё каталог из ≈100 бесплатных ретро-игр и демоверсии некоторых новых игр.'},
    {name: 'EA Play', text: 'без доступа к онлайн-режиму без PS Plus, открывает каталог из ≈60 бесплатных игр от Electronic Arts: FC 26, NHL 25, UFC 4, Battlefield 2042, It Takes Two, A Way Out и другие хиты издателя.'}
];

export const showsPlayStationInfo = (brandKey, path) =>
    PS_BRANDS.includes(brandKey) && !/xbox/i.test(String(path || ''));

export default function SubscriptionInfo() {
    return (
        <>
            <section className={style.block}>
                <div className={style.blockHead}>
                    <h2 className={style.blockTitle}>Важная информация</h2>
                </div>

                <div className={style.includes}>
                    {IMPORTANT.map((text) => (
                        <div key={text} className={style.include}>
                            <span className={style.includeMark} aria-hidden="true">!</span>
                            <span>{text}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={style.block}>
                <div className={style.blockHead}>
                    <h2 className={style.blockTitle}>О подписках</h2>
                </div>

                <div className={style.includes}>
                    {ABOUT.map((item) => (
                        <div key={item.name} className={style.include}>
                            <span className={style.includeMark} aria-hidden="true">✓</span>
                            <span>
                                <b className={style.includeName}>{item.name}</b> — {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
