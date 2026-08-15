import { useState, useEffect } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { usePlatform } from './utils/usePlatform';
import { getTelegramObject } from './utils/isTg';
import { useMockBackButton } from './useMockBackButton';

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

// Замер env(safe-area-inset-*) вставляет узел в DOM и читает getComputedStyle, то есть
// форсирует синхронный reflow. Хук вызывается ~19 компонентами, и раньше каждый из них
// делал этот замер на КАЖДОЕ событие visualViewport (а при анимации клавиатуры их
// десятки) — отсюда заметные лаги и дёрганье в момент появления клавиатуры.
// Реально safe-area меняется только при повороте экрана или входе/выходе из fullscreen,
// поэтому кешируем результат на уровне модуля (кеш общий для всех экземпляров хука)
// и сбрасываем его по ширине вьюпорта и явной инвалидации.
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

// Слушатели висят в каждом экземпляре хука, поэтому на одно событие сброс кеша
// пришёл бы 19 раз подряд и мы бы получили 19 замеров вместо одного. Флаг схлопывает
// все сбросы в пределах одного кадра: первый слушатель сбрасывает и заново измеряет,
// остальные попадают уже в свежий кеш.
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

// Типы <input>, при фокусе на которых мобильные ОС показывают текстовую клавиатуру
// (checkbox/radio/range/file/color и т.п. клавиатуру не открывают)
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

    const mockTopInset = isMockBackButtonVisible && (isVk || isWeb) ? 45 : 0;

    const [insets, setInsets] = useState({
        safeAreaInset: { top: 0, bottom: 0 },
        contentSafeAreaInset: { top: 0, bottom: 0 },
        isKeyboardOpen: false,
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    useEffect(() => {
        const tg = getTelegramObject();
        let currentVkInsets = { top: 0, bottom: 0 };

        // Определение клавиатуры комбинированное:
        // - в Telegram сравниваем viewportHeight/viewportStableHeight — это ровно то, для чего
        //   Telegram отдаёт эти два поля, и работает стабильно во всех версиях клиента;
        // - иначе следим за фокусом на текстовых полях и сравниваем текущую высоту
        //   visualViewport с "базовой" высотой (зафиксированной, когда ни одно поле не в фокусе).
        //   Одного сравнения с window.innerHeight недостаточно: на части версий iOS/Android
        //   innerHeight сам уменьшается вместе с visualViewport при открытии клавиатуры, из-за
        //   чего старая эвристика "vv.height < innerHeight * 0.85" не срабатывала, а на
        //   некоторых iOS innerHeight после закрытия клавиатуры не возвращался к исходному
        //   значению, из-за чего бар не разворачивался обратно.
        let isFieldFocused = isEditableTarget(document.activeElement);
        let baselineHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        let baselineRecalcTimer = null;

        const calculateInsets = () => {
            const system = getSystemInsets();
            const vv = window.visualViewport;

            // Используем visualViewport для точного определения размеров, иначе фоллбек на inner
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

            if (isVk) {
                top = currentVkInsets.top || system.top;
                bottom = isKeyboard ? 0 : (currentVkInsets.bottom || system.bottom);
            } else if (isTg && tg) {
                top = tg.safeAreaInset?.top || system.top;
                bottom = isKeyboard ? 0 : (tg.safeAreaInset?.bottom || system.bottom);
            }

            return {
                safeAreaInset: {
                    top: top + mockTopInset,
                    bottom: bottom
                },
                contentSafeAreaInset: {
                    top: top,
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
                // Расширенная проверка для предотвращения лишних ререндеров
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

        updateInsets();

        const handleResize = () => {
            window.requestAnimationFrame(updateInsets);
        };

        const scheduleBaselineRecalc = () => {
            if (baselineRecalcTimer) window.clearTimeout(baselineRecalcTimer);
            // Ждём завершения анимации скрытия клавиатуры/адресной строки браузера,
            // прежде чем зафиксировать новую "полную" высоту как базовую
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

        // В Telegram safe-area меняется ещё и при входе/выходе из fullscreen —
        // ширина при этом не меняется, поэтому кеш надо сбросить явно
        const handleTgViewportChanged = () => {
            scheduleSystemInsetsInvalidate();
            handleResize();
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

        let vkSubscription = null;
        if (isVk) {
            vkSubscription = (e) => {
                if (e.detail.type === 'VKWebAppUpdateConfig') {
                    const data = e.detail.data;
                    if (data?.safe_area) {
                        currentVkInsets = {
                            top: data.safe_area.top || 0,
                            bottom: data.safe_area.bottom || 0
                        };
                        updateInsets();
                    }
                }
            };
            vkBridge.subscribe(vkSubscription);
        }

        if (isTg && tg) {
            tg.onEvent('viewportChanged', handleTgViewportChanged);
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
            if (isVk && vkSubscription) {
                vkBridge.unsubscribe(vkSubscription);
            }
            if (isTg && tg) {
                tg.offEvent('viewportChanged', handleTgViewportChanged);
            }
        };
    }, [isVk, isTg, isWeb, mockTopInset]);

    return insets;
}