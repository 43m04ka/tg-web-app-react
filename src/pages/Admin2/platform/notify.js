const toastListeners = new Set();
const confirmListeners = new Set();

let seq = 0;
let toasts = [];
let pendingConfirm = null;

const emitToasts = () => toastListeners.forEach((listener) => listener(toasts));
const emitConfirm = () => confirmListeners.forEach((listener) => listener(pendingConfirm));

export const subscribeToasts = (listener) => {
    toastListeners.add(listener);
    listener(toasts);
    return () => toastListeners.delete(listener);
};

export const dismissToast = (id) => {
    toasts = toasts.filter((item) => item.id !== id);
    emitToasts();
};

export const toast = ({tone = 'info', title, text = '', timeout = 5000}) => {
    seq += 1;
    const id = seq;

    toasts = [...toasts, {id, tone, title, text}].slice(-4);
    emitToasts();

    if (timeout) setTimeout(() => dismissToast(id), timeout);

    return id;
};

export const toastDone = (title, text) => toast({tone: 'positive', title, text});
export const toastFail = (title, text) => toast({tone: 'danger', title, text, timeout: 9000});

export const subscribeConfirm = (listener) => {
    confirmListeners.add(listener);
    listener(pendingConfirm);
    return () => confirmListeners.delete(listener);
};

export const askConfirm = ({title, text = '', consequence = '', confirmText = 'Продолжить', tone = 'accent'}) => (
    new Promise((resolve) => {
        pendingConfirm = {
            title,
            text,
            consequence,
            confirmText,
            tone,
            settle: (answer) => {
                pendingConfirm = null;
                emitConfirm();
                resolve(answer);
            },
        };
        emitConfirm();
    })
);
