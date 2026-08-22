import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import s from './Feedback.module.scss';

/**
 * Тосты и подтверждения для админки.
 *
 * До этого результат действия сообщался через alert(), а «точно удалить?» — через
 * window.confirm(). Нативные окна блокируют вкладку, игнорируют тему и выглядят как
 * системная ошибка браузера, а не как ответ интерфейса.
 *
 * Провайдер один на всю админку, поэтому тост переживает закрытие вкладки, из которой
 * его показали: «Снято с продажи: 12» не должно исчезать вместе с формой.
 */

const FeedbackContext = createContext(null);

const AUTO_HIDE_MS = 4000;

let toastCounter = 0;

export const FeedbackProvider = ({children}) => {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);

    const timersRef = useRef(new Map());

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));

        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const showToast = useCallback((text, tone = 'info') => {
        if (!text) return;

        toastCounter += 1;
        const id = toastCounter;
        setToasts((prev) => [...prev, {id, text: String(text), tone}]);

        // Ошибку не прячем сама собой: её нужно успеть прочитать и, как правило,
        // скопировать — закрывается крестиком
        if (tone !== 'error') {
            timersRef.current.set(id, setTimeout(() => dismissToast(id), AUTO_HIDE_MS));
        }
    }, [dismissToast]);

    /**
     * Подтверждение действия. Возвращает промис: true — согласились.
     *
     * Промис держим в ref, чтобы диалог мог быть чисто визуальным состоянием
     * и не тянул за собой колбэки в дерево компонентов.
     */
    const resolveRef = useRef(null);

    const confirm = useCallback(({
        title,
        text,
        confirmLabel = 'Подтвердить',
        cancelLabel = 'Отмена',
        danger = false,
    }) => new Promise((resolve) => {
        resolveRef.current = resolve;
        setConfirmState({title, text, confirmLabel, cancelLabel, danger});
    }), []);

    const closeConfirm = useCallback((result) => {
        setConfirmState(null);
        const resolve = resolveRef.current;
        resolveRef.current = null;
        if (resolve) resolve(result);
    }, []);

    const value = useMemo(() => ({showToast, confirm}), [showToast, confirm]);

    return (
        <FeedbackContext.Provider value={value}>
            {children}

            <div className={s.toastStack} role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`${s.toast} ${s[`toast_${toast.tone}`] || ''}`}>
                        <span className={s.toastText}>{toast.text}</span>
                        <button type="button" className={s.toastClose}
                                onClick={() => dismissToast(toast.id)} aria-label="Закрыть">
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {confirmState ? (
                <div className={s.confirmOverlay}
                     role="dialog"
                     aria-modal="true"
                     onMouseDown={(event) => {
                         // Клик мимо окна — отказ. Именно mousedown: иначе выделение
                         // текста внутри окна, отпущенное снаружи, закрывало бы диалог
                         if (event.target === event.currentTarget) closeConfirm(false);
                     }}>
                    <div className={s.confirmBox}>
                        {confirmState.title ? <h2 className={s.confirmTitle}>{confirmState.title}</h2> : null}
                        {confirmState.text ? <p className={s.confirmText}>{confirmState.text}</p> : null}

                        <div className={s.confirmActions}>
                            <button type="button" className={s.confirmBtn}
                                    onClick={() => closeConfirm(false)}>
                                {confirmState.cancelLabel}
                            </button>
                            <button type="button"
                                    autoFocus
                                    className={`${s.confirmBtn} ${confirmState.danger ? s.confirmBtnDanger : s.confirmBtnPrimary}`}
                                    onClick={() => closeConfirm(true)}>
                                {confirmState.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </FeedbackContext.Provider>
    );
};

/**
 * Доступ к тостам и подтверждениям.
 *
 * Без провайдера не падаем: подтверждение уходит в window.confirm, сообщение — в консоль.
 * Иначе любой экран, отрисованный вне админки (тесты, отдельная превью-страница),
 * ронял бы всё дерево вместо того, чтобы просто остаться без красивых окон.
 */
export const useFeedback = () => {
    const context = useContext(FeedbackContext);

    return useMemo(() => context || {
        showToast: (text) => console.warn('[feedback]', text),
        confirm: ({text, title}) => Promise.resolve(window.confirm([title, text].filter(Boolean).join('\n'))),
    }, [context]);
};

export default FeedbackContext;
