import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../store/useSessionStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {recallView, rememberView} from '../../shared/lib/viewMemory';
import {isEmailValid, money} from '../Basket/cartModel';
import {CodeDone, CodeFail, CodeStalled, CodeWaiting} from './ServicesScreens';
import {isManual, isSellable, resolveSelection} from './servicesModel';
import ServicesView from './ServicesView';
import {useCodeCatalog} from './useCodeCatalog';
import {SCREEN, useCodeOrder} from './useCodeOrder';
import style from './Services.module.scss';

const FORM_KEY = 'services:form';

const fullName = (user) => `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

const nativeContact = (user) => {
    if (!user?.id || user.isGuest) return null;
    if (user.platform === 'vk') return `https://vk.com/im/convo/${user.id} \n${fullName(user)}`.trim();
    if (user.platform !== 'tg') return null;
    if (user.username) return `@${user.username}`;

    return `${fullName(user) || 'Пользователь Telegram'} \ntg://user?id=${user.id}`;
};

export default function Services() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const userId = useSessionStore(selectUserId);
    const user = useSessionStore((state) => state.user);
    const platform = useSessionStore((state) => state.platform);
    const botType = useSessionStore((state) => state.botType);

    const {brands, error, retry} = useCodeCatalog();

    const saved = useMemo(() => recallView(FORM_KEY) || {}, []);

    const [brandId, setBrandId] = useState(saved.brandId ?? null);
    const [kind, setKind] = useState(saved.kind ?? null);
    const [regionName, setRegionName] = useState(saved.regionName ?? null);
    const [groupName, setGroupName] = useState(saved.groupName ?? null);
    const [offerId, setOfferId] = useState(saved.offerId ?? null);
    const [email, setEmail] = useState(saved.email || '');
    const [isTouched, setTouched] = useState(false);

    const flow = useCodeOrder(userId);
    const scrollRef = useScrollMemory('services', {ready: brands !== null});

    const view = useMemo(
        () => resolveSelection(brands, {brandId, kind, regionName, groupName, offerId}),
        [brands, brandId, kind, regionName, groupName, offerId]
    );

    const {brand, offer} = view;

    useEffect(() => {
        rememberView(FORM_KEY, {
            brandId: brand?.id ?? null,
            kind: view.kind,
            regionName: view.regionName,
            groupName: view.groupKey,
            offerId: offer?.id ?? null,
            email
        });
    }, [brand, view.kind, view.regionName, view.groupKey, offer, email]);

    const back = useCallback(() => {
        hapticImpact('light');
        navigate('/');
    }, [navigate]);

    const hasNativeBack = useBackButton(back, {enabled: flow.screen === SCREEN.NONE});

    const pickBrand = useCallback((item) => {
        hapticSelection();
        setBrandId(item.id);
        setKind(null);
        setRegionName(null);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const pickKind = useCallback((value) => {
        hapticSelection();
        setKind(value);
        setRegionName(null);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const pickRegion = useCallback((value) => {
        hapticSelection();
        setRegionName(value);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const pickGroup = useCallback((value) => {
        hapticSelection();
        setGroupName(value);
        setOfferId(null);
    }, []);

    const pickOffer = useCallback((value) => {
        hapticSelection();
        setOfferId(value.id);
    }, []);

    const isEmailReady = isEmailValid(email);
    const isStockReady = isSellable(offer);
    const isReady = Boolean(userId) && isStockReady && isEmailReady;

    const blockReason = useMemo(() => {
        if (!isTouched || isReady) return null;
        if (!userId) return 'Не удалось определить ваш профиль — перезапустите приложение';
        if (!offer) return 'Выберите номинал';
        if (!isStockReady) return 'Этот номинал закончился — выберите другой';
        if (!isEmailReady) return 'Укажите почту для чека';

        return null;
    }, [isTouched, isReady, userId, offer, isStockReady, isEmailReady]);

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending) return;

        hapticImpact('medium');

        flow.submit({
            platform,
            contact: nativeContact(user) || `Почта: ${email.trim()}`,
            username: user?.username || undefined,
            email: email.trim(),
            offerId: offer.id,
            quantity: 1
        }, {
            title: [brand?.name, offer.groupName, offer.denomination].filter(Boolean).join(' · '),
            manual: isManual(offer)
        });
    }, [isReady, flow, platform, user, email, offer, brand]);

    if (flow.screen === SCREEN.WAITING) {
        return <CodeWaiting order={flow.order} onOpenAgain={flow.openAgain} onCancel={flow.cancel}/>;
    }

    if (flow.screen === SCREEN.DONE) {
        return <CodeDone order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    if (flow.screen === SCREEN.FAIL) {
        return <CodeFail order={flow.order} onRetry={flow.close} onClose={back}/>;
    }

    if (flow.screen === SCREEN.STALLED) {
        return <CodeStalled order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    return (
        <ServicesView
            scrollRef={scrollRef}
            brands={brands}
            view={view}
            error={error}
            onRetry={retry}
            onBack={back}
            showBack={!hasNativeBack}
            topInset={contentSafeAreaInset.top}
            bottomInset={safeAreaInset.bottom}
            email={email}
            emailError={isTouched && !isEmailReady ? 'Проверьте адрес почты' : null}
            onEmailChange={setEmail}
            onPickBrand={pickBrand}
            onPickKind={pickKind}
            onPickRegion={pickRegion}
            onPickGroup={pickGroup}
            onPickOffer={pickOffer}
            action={(
                <>
                    {blockReason ? <p className={style.actionError}>{blockReason}</p> : null}
                    {flow.error ? <p className={style.actionError}>{flow.error}</p> : null}

                    <button
                        type="button"
                        className={style.primary}
                        disabled={flow.isSending}
                        onClick={submit}
                    >
                        {flow.isSending ? 'Создаём заказ…' : 'Оплатить'}
                        {offer && !flow.isSending ? (
                            <span className={style.primaryPrice}>{money(offer.price)}</span>
                        ) : null}
                    </button>
                </>
            )}
        />
    );
}
