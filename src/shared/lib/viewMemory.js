const LIMIT = 40;

const store = new Map();

const touch = (key, value) => {
    store.delete(key);
    store.set(key, value);

    while (store.size > LIMIT) store.delete(store.keys().next().value);
};

export const rememberView = (key, value) => {
    if (!key) return;
    touch(key, value);
};

export const recallView = (key) => (key ? store.get(key) : undefined);

export const forgetView = (key) => {
    if (key) store.delete(key);
};

export const forgetViewsWith = (prefix) => {
    [...store.keys()].forEach((key) => {
        if (key.startsWith(prefix)) store.delete(key);
    });
};
