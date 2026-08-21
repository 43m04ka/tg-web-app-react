import { useState, useEffect } from 'react';
import { subscribeVkSafeArea } from '../lib/vk';
import { usePlatform } from './usePlatform';
import { getTelegramObject, requestTelegramInsets } from '../lib/telegram';
import { useMockBackButton } from './useMockBackButton';
import { useTelegramSdk } from './useTelegramSdk';

const measureSystemInsets = () => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.paddingTop = 'env(safe-area-inset-top)';
    div.style.paddingBottom = 'env(safe-area-inset-bottom)';
    div.style.visibility = 'hidden';
    div.style.pointerEvents = 'none';
    document.body.appendChild(div);

    const style = window.getComputedStyle(div);
    const top = parseInt(style.paddingTop, 10) || 0;
    const bottom = parseInt(style.paddingBottom, 10) || 0;

    document.body.removeChild(div);
    return { top, bottom };
};

let systemInsetsCache = null;
let systemInsetsCacheWidth = -1;

const getSystemInsets = () => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0 };

    if (systemInsetsCache && systemInsetsCacheWidth === window.innerWidth) {
        return systemInsetsCache;
    }

    systemInsetsCache = measureSystemInsets();
    systemInsetsCacheWidth = window.innerWidth;
    return systemInsetsCache;
};

let invalidateScheduled = false;

const scheduleSystemInsetsInvalidate = () => {
    if (invalidateScheduled) return;
    invalidateScheduled = true;
    window.requestAnimationFrame(() => {
        invalidateScheduled = false;
    });
    systemInsetsCache = null;
    systemInsetsCacheWidth = -1;
};

const TG_FULLSCREEN_MIN_TOP = 24;
const TG_FULLSCREEN_MIN_CHROME = 46;

const KEYBOARD_INPUT_TYPES = new Set([
    'text', 'search', 'email', 'tel', 'url', 'number', 'password'
]);

const isEditableTarget = (el) => {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT') {
        const type = (el.type || 'text').toLowerCase();
        return KEYBOARD_INPUT_TYPES.has(type);
    }
    return !!el.isContentEditable;
};

export function useAppInsets() {
    const { isVk, isTg, isWeb } = usePlatform();
    const isMockBackButtonVisible = useMockBackButton();
    const sdkToken = useTelegramSdk();

    const mockTopInset = isMockBackButtonVisible && (isVk || isWeb) ? 45 : 0;

    const [insets, setInsets] = useState({
        safeAreaInset: { top: 0, bottom: 0 },
        contentSafeAreaInset: { top: 0, bottom: 0 },
        isKeyboardOpen: false,
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    useEffect(() => {
        const tgForEvents = getTelegramObject();
        let currentVkInsets = { top: 0, bottom: 0 };

        let isFieldFocused = isEditableTarget(document.activeElement);
        let baselineHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        let baselineRecalcTimer = null;

        const calculateInsets = () => {
            const system = getSystemInsets();
            const vv = window.visualViewport;
            const tg = getTelegramObject();

            const currentWidth = vv ? vv.width : window.innerWidth;
            const currentHeight = vv ? vv.height : window.innerHeight;

            let isKeyboard;
            if (isTg && tg && typeof tg.viewportHeight === 'number' && typeof tg.viewportStableHeight === 'number') {
                isKeyboard = tg.viewportHeight < tg.viewportStableHeight - 40;
            } else if (isFieldFocused) {
                isKeyboard = vv ? (baselineHeight - currentHeight) > 80 : true;
            } else {
                isKeyboard = false;
            }

            let top = system.top;
            let bottom = isKeyboard ? 0 : system.bottom;
            let chromeTop = 0;

            if (isVk) {
                top = currentVkInsets.top || system.top;
                bottom = isKeyboard ? 0 : (currentVkInsets.bottom || system.bottom);
            } else if (isTg && tg) {
                top = tg.safeAreaInset?.top || system.top;
                bottom = isKeyboard ? 0 : (tg.safeAreaInset?.bottom || system.bottom);
                chromeTop = tg.contentSafeAreaInset?.top || 0;

                if (tg.isFullscreen === true) {
                    top = Math.max(top, TG_FULLSCREEN_MIN_TOP);
                    chromeTop = Math.max(chromeTop, TG_FULLSCREEN_MIN_CHROME);
                }
            }

            return {
                safeAreaInset: {
                    top: top + mockTopInset,
                    bottom: bottom
                },
                contentSafeAreaInset: {
                    top: top + chromeTop + mockTopInset,
                    bottom: bottom
                },
                isKeyboardOpen: isKeyboard,
                width: currentWidth,
                height: currentHeight
            };
        };

        const updateInsets = () => {
            setInsets(prev => {
                const next = calculateInsets();
                if (
                    prev.safeAreaInset.top === next.safeAreaInset.top &&
                    prev.safeAreaInset.bottom === next.safeAreaInset.bottom &&
                    prev.contentSafeAreaInset.top === next.contentSafeAreaInset.top &&
                    prev.contentSafeAreaInset.bottom === next.contentSafeAreaInset.bottom &&
                    prev.isKeyboardOpen === next.isKeyboardOpen &&
                    prev.width === next.width &&
                    prev.height === next.height
                ) {
                    return prev;
                }
                return next;
            });
        };

        const settle = () => {
            if (isTg) requestTelegramInsets();
            updateInsets();
        };

        settle();

        const settleTimers = [80, 250, 600, 1200, 2000].map((delay) => window.setTimeout(settle, delay));

        const handleResize = () => {
            window.requestAnimationFrame(updateInsets);
        };

        const scheduleBaselineRecalc = () => {
            if (baselineRecalcTimer) window.clearTimeout(baselineRecalcTimer);
            baselineRecalcTimer = window.setTimeout(() => {
                if (!isFieldFocused) {
                    const currentVv = window.visualViewport;
                    baselineHeight = currentVv ? currentVv.height : window.innerHeight;
                    updateInsets();
                }
            }, 400);
        };

        const handleFocusIn = (e) => {
            if (!isEditableTarget(e.target)) return;
            isFieldFocused = true;
            if (baselineRecalcTimer) {
                window.clearTimeout(baselineRecalcTimer);
                baselineRecalcTimer = null;
            }
            updateInsets();
        };

        const handleFocusOut = (e) => {
            if (!isEditableTarget(e.target)) return;
            isFieldFocused = false;
            scheduleBaselineRecalc();
            updateInsets();
        };

        const handleOrientationChange = () => {
            window.setTimeout(() => {
                scheduleSystemInsetsInvalidate();
                if (!isFieldFocused) {
                    const currentVv = window.visualViewport;
                    baselineHeight = currentVv ? currentVv.height : window.innerHeight;
                }
                updateInsets();
            }, 400);
        };

        const handleTgViewportChanged = () => {
            scheduleSystemInsetsInvalidate();
            handleResize();
        };

        let fullscreenTimer = null;

        const handleTgFullscreenChanged = () => {
            handleTgViewportChanged();
            if (fullscreenTimer) window.clearTimeout(fullscreenTimer);
            fullscreenTimer = window.setTimeout(settle, 120);
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            window.visualViewport.addEventListener('scroll', handleResize);
        } else {
            window.addEventListener('resize', handleResize);
        }
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);
        window.addEventListener('orientationchange', handleOrientationChange);

        let unsubscribeVk = null;
        if (isVk) {
            unsubscribeVk = subscribeVkSafeArea((safeArea) => {
                currentVkInsets = safeArea;
                updateInsets();
            });
        }

        const TG_EVENTS = ['viewportChanged', 'safeAreaChanged', 'contentSafeAreaChanged'];

        if (isTg && tgForEvents) {
            TG_EVENTS.forEach((event) => tgForEvents.onEvent(event, handleTgViewportChanged));
            tgForEvents.onEvent('fullscreenChanged', handleTgFullscreenChanged);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
                window.visualViewport.removeEventListener('scroll', handleResize);
            } else {
                window.removeEventListener('resize', handleResize);
            }
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
            window.removeEventListener('orientationchange', handleOrientationChange);
            if (baselineRecalcTimer) window.clearTimeout(baselineRecalcTimer);
            if (fullscreenTimer) window.clearTimeout(fullscreenTimer);
            settleTimers.forEach((timerId) => window.clearTimeout(timerId));
            if (unsubscribeVk) unsubscribeVk();
            if (isTg && tgForEvents) {
                TG_EVENTS.forEach((event) => tgForEvents.offEvent(event, handleTgViewportChanged));
                tgForEvents.offEvent('fullscreenChanged', handleTgFullscreenChanged);
            }
        };
    }, [isVk, isTg, isWeb, mockTopInset, sdkToken]);

    return insets;
}