import vkBridge from '@vkontakte/vk-bridge';

export const isVk = () => {
    return (
        vkBridge.isWebView() ||
        vkBridge.isIframe() ||
        window.location.pathname.includes('vk.com')
    );
};