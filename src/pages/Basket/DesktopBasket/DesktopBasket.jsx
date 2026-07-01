import React, { useEffect, useRef, useState } from 'react';
import style from './DesktopBasket.module.scss';
import { useTelegram } from '../../../hooks/useTelegram';
import useGlobalData from '../../../hooks/useGlobalData';
import { useNavigate } from 'react-router-dom';
import Recommendations from '../../../shared/ui/Recommendations/Recommendations';
import { useServerUser } from '../../../hooks/useServerUser';
import DesktopPositionBasket from './DesktopPositionBasket';
import DesktopAccountData from './DesktopAccountData';
import DesktopPayment from './DesktopPayment';
import DesktopPromo from './DesktopPromo';
import DesktopButtonBuy from './DesktopButtonBuy';
import DesktopOrderPage from './DesktopOrderPage';
import DesktopOrderContact from './DesktopOrderContact';
import DesktopEmptyBasket from './DesktopEmptyBasket';

const SIMULATE_ORDER = false;

const DesktopBasket = () => {
    const { createOrder } = useServerUser();
    const { user, tg, isVk, isTg, isWeb, vkGroupId } = useTelegram();
    const { pageId, catalogList, basket, updateBasket, pageList, bufferCardsRecommendations } = useGlobalData();
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState('');
    const [promoData, setPromoData] = useState({ percent: 0, name: '' });
    const [promoIsVisible, setPromoIsVisible] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [username, setUsername] = useState('');
    const inputRef = useRef(null);
    const [paymentString, setPaymentString] = useState('Способ оплаты: СБП');

    const pageType = (!pageList || pageId === -1) ? null : (pageList.find(p => p.id === pageId)?.type || null);

    const isBuyEnabled = isVk
        ? true
        : (isTg ? (typeof user.username !== 'undefined' || username !== '') : username.trim() !== '');

    const orderUsername = isWeb
        ? username
        : isVk
            ? `https://vk.com/im/convo/${user.id} \n${user.first_name} ${user.last_name}`
            : '@' + (user.username || username);

    const sourceData = isVk
        ? { source: 'vk', vkGroupId: vkGroupId }
        : (isTg ? { source: 'tg' } : { source: 'web' });

    useEffect(() => {
        tg.BackButton.show();
        const onBack = () => navigate(-1);
        tg.onEvent('backButtonClicked', onBack);
        return () => {
            tg.offEvent('backButtonClicked', onBack);
        };
    }, [navigate, tg]);

    if (basket === null) return null;

    if (basket.length === 0 && orderData === null) {
        return <DesktopEmptyBasket />;
    }

    // When basket is empty but orderData is set, the order page overlay covers everything —
    // so we fall through to render the DesktopOrderPage (position: fixed) instead of returning null.

    const sumPrice = basket.length > 0
        ? basket.map(el => (el.similarCard !== null ? el.similarCard.price * el.count : el.price * el.count))
               .reduce((acc, val) => acc + val, 0)
        : 0;

    const totalPrice = sumPrice * (1 - promoData.percent / 100);

    return (
        <div className={style.mainContainer}>
            <div className={style.contentWrapper}>
                <div className={style.basketBlock}>
                    <p className={style.title}>Ваша корзина:</p>
                    {basket.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <DesktopPositionBasket percent={promoData.percent} product={item} />
                            {index !== basket.length - 1 && <div className={style.separator} />}
                        </React.Fragment>
                    ))}
                </div>
                {pageType !== null && pageType !== 'other' && (
                    <div className={style.basketBlock}>
                        <p className={style.title}>Куда оформить заказ:</p>
                        <DesktopAccountData returnAccountData={setAccountData} pageType={pageType} />
                    </div>
                )}
                <div className={style.basketBlock}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <p className={style.title}>Итого:</p>
                            {promoData.percent > 0 && (
                                <p className={style.oldPrice}>{sumPrice}₽</p>
                            )}
                            <p className={style.title}
                               style={{ marginRight: '0', marginLeft: promoData.percent > 0 ? '0' : 'auto' }}>
                                {totalPrice}₽
                            </p>
                        </div>

                        <DesktopPayment setPaymentMethodString={setPaymentString} sumPrice={totalPrice} />

                        <div className={style.separator} />

                        <DesktopOrderContact username={username} setUsername={setUsername} inputRef={inputRef} />

                        <div style={{ height: promoIsVisible ? '46px' : '36px', transition: 'all 0.3s' }}>
                            {promoIsVisible ? (
                                <DesktopPromo setPromoData={setPromoData} />
                            ) : (
                                <div className={style.promoLabel} onClick={() => setPromoIsVisible(true)}>
                                    У меня есть промокод
                                </div>
                            )}
                        </div>

                        <DesktopButtonBuy
                            onBuy={(onLoaded) => {
                                if (SIMULATE_ORDER) {
                                    setTimeout(() => {
                                        setOrderData({
                                            number: Math.floor(Math.random() * 9000) + 1000,
                                            list: basket,
                                            summa: totalPrice,
                                            message: null,
                                        });
                                        onLoaded();
                                    }, 1500);
                                    return;
                                }
                                navigate('/' + pageList.filter(item => item.id === pageId)[0].link + '/basket');
                                createOrder(paymentString, accountData, {
                                    id: user.id, username: orderUsername
                                }, pageId, promoData.name, sourceData, (res) => {
                                    setOrderData(res);
                                    onLoaded();
                                }).then();
                            }}
                            inputUsernameRef={inputRef}
                            isEnabled={isBuyEnabled}
                        />

                        <div className={style.labelBuy}>
                            Нажимая на кнопку, Вы соглашаетесь с{' '}
                            <a href={'https://gwstore.su/pk'}>Условиями обработки персональных данных</a>
                            , а также с{' '}
                            <a href={'https://gwstore.su/privacy'}>Пользовательским соглашением</a>
                        </div>
                </div>
            </div>
            <Recommendations from={'basket'} desktop data={bufferCardsRecommendations} />
            {orderData !== null && <DesktopOrderPage orderData={orderData} />}
        </div>
    );
};

export default DesktopBasket;
