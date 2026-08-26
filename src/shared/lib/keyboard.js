const KEEPER_STYLE =
    'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;' +
    'font-size:16px;opacity:0;pointer-events:none;';

const KEEPER_LIFETIME_MS = 2500;

let keeper = null;
let timer = 0;

const drop = () => {
    if (!keeper) return;
    keeper.remove();
    keeper = null;
};

export const primeKeyboard = () => {
    if (typeof document === 'undefined') return;

    window.clearTimeout(timer);
    drop();

    keeper = document.createElement('input');
    keeper.type = 'text';
    keeper.tabIndex = -1;
    keeper.setAttribute('aria-hidden', 'true');
    keeper.style.cssText = KEEPER_STYLE;

    document.body.appendChild(keeper);
    keeper.focus();

    timer = window.setTimeout(drop, KEEPER_LIFETIME_MS);
};

export const claimKeyboard = (element) => {
    if (!keeper) return false;

    window.clearTimeout(timer);
    element?.focus();
    drop();

    return true;
};
