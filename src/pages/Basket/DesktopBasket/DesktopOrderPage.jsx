import React, { useEffect, useState } from 'react';
import style from './DesktopOrderPage.module.scss';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../../hooks/useTelegram';
import logoIcon from '../../../shared/assets/icons/golo.png';

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try { document.execCommand('copy'); } catch (e) { /* fallback failed */ }
        document.body.removeChild(textArea);
    }
};

const DesktopOrderPage = ({ orderData }) => {
    const { number, list, summa, message } = orderData;
    const { isVk, vkGroupId } = useTelegram();
    const [stage, setStage] = useState(0);
    const [openingChat, setOpeningChat] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => setStage(1), 1350);
        setTimeout(() => {
            try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success'); } catch (e) { /* noop */ }
        }, 750);
    }, []);

    useEffect(() => {
        if (stage === 1 && isVk && message) copyToClipboard(message);
    }, [stage, isVk, message]);

    const handleOpenVkChat = () => {
        setOpeningChat(true);
        copyToClipboard(message);
        setTimeout(() => {
            window.open(`https://vk.com/im?sel=-${vkGroupId}`, '_blank');
            setOpeningChat(false);
        }, 100);
    };

    return (
        <div className={style.container}>
            {stage === 0 ? (
                <>
                    <div className={style.golo}>
                        <img src={logoIcon} alt="logo" />
                    </div>
                    <div className={style.orderPageContainer} />
                </>
            ) : (
                <div className={style.orderPage}>
                    {/* Hero */}
                    <div className={style.heroCard}>
                        <div className={style.checkIcon}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12.5L10 17.5L19 7" stroke="white" strokeWidth="2.5"
                                      strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className={style.heroTitle}>
                            {'Заказ №' + String(number) + ' успешно ' + (isVk ? 'сформирован' : 'оформлен') + '!'}
                        </div>
                        <div className={style.heroSubtitle}>Спасибо за покупку</div>
                    </div>

                    {/* Items */}
                    <div className={style.itemsCard}>
                        <p className={style.sectionTitle}>Состав заказа</p>
                        <div className={style.itemsList}>
                            {list.map((item, index) => (
                                <React.Fragment key={index}>
                                    <div className={style.orderPosition}>
                                        <div style={{ backgroundImage: `url(${item.image})` }} />
                                        <div>
                                            <p>{item.name}</p>
                                            <p>{item.platform !== null ? 'для ' + item.platform : ''}</p>
                                            <p>{item.similarCard !== null ? item.similarCard.price : item.price} ₽</p>
                                        </div>
                                    </div>
                                    {list.length - 1 > index && <div className={style.separator} />}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className={style.totalRow}>
                            <span>Итого</span>
                            <span>{summa} ₽</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={style.actionsCard}>
                        {isVk ? (
                            <>
                                <div className={style.copyNotice}>
                                    ✓ Данные заказа скопированы в буфер обмена
                                </div>
                                <div className={style.label}>
                                    Чтобы оформить Ваш заказ — перейдите в чат сообщества по кнопке ниже и отправьте
                                    скопированное сообщение. Менеджер оперативно ответит Вам в рабочее время.
                                </div>
                                <button
                                    onClick={handleOpenVkChat}
                                    disabled={openingChat}
                                    className={style.secondaryButton}
                                    style={{ opacity: openingChat ? 0.6 : 1, cursor: openingChat ? 'not-allowed' : 'pointer' }}
                                >
                                    {openingChat ? 'Открываем чат...' : 'Перейти в чат сообщества'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className={style.label}>
                                    Для оплаты и активации заказа с Вами свяжется наш менеджер{' '}
                                    <span className={style.highlight}>@gwstore_admin</span>.
                                    <br />Рабочее время с 10:00 до 22:00 по МСК.
                                </div>
                                <button
                                    onClick={() => window.open('https://t.me/gwstore_admin')}
                                    className={style.secondaryButton}
                                >
                                    Поддержка магазина
                                </button>
                            </>
                        )}
                        <button className={style.primaryButton} onClick={() => navigate('/')}>
                            Вернуться на главную
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesktopOrderPage;
