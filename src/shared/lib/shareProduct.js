// Карточкой делимся заранее заготовленным сообщением: бек через
// /api/product/prepareShareMessage создаёт его ботом и возвращает id, а Telegram по
// этому id открывает нативный шэр (tg.shareMessage).
//
// Метод shareMessage появился только в Bot API 8.0, а вне Telegram (VK, обычный
// браузер) его нет вовсе — поэтому его наличие обязательно проверять. Без проверки
// клик по «Поделиться карточкой» падал с TypeError: tg.shareMessage is not a function.

export const canShareViaTelegram = (tg) => typeof tg?.shareMessage === 'function';

const hapticSoft = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('soft');
};

// Запасной путь для VK/браузера и старых версий Telegram: системное «Поделиться»,
// а если его нет — просто кладём текст со ссылкой в буфер обмена.
const shareFallback = async (text) => {
    if (!text) return false;

    if (typeof navigator.share === 'function') {
        try {
            await navigator.share({ text });
            return true;
        } catch (e) {
            // пользователь закрыл системный диалог — это не ошибка, ничего больше не делаем
            if (e?.name === 'AbortError') return false;
        }
    }

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        console.error('[shareProduct] не удалось поделиться карточкой:', e);
        return false;
    }
};

export const shareProduct = async ({ tg, prepareShareMessage, productId, userId, fallbackText }) => {
    if (!canShareViaTelegram(tg)) {
        return shareFallback(fallbackText);
    }

    await prepareShareMessage((messageId) => {
        // бек мог не отдать id (ошибка/пустой ответ) — тогда не зовём Telegram с undefined
        if (!messageId) {
            shareFallback(fallbackText);
            return;
        }
        tg.shareMessage(messageId);
        hapticSoft();
    }, productId, userId);

    return true;
};
