const tg = window.Telegram.WebApp;

export function useTelegram() {
    const onCloce = () => {
        tg.close();
    }

    const onToggleButton = () => {
        if (tg.MainButton.isVisible) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        }
    }

    return {
        onCloce, onToggleButton, tg,
        user: {id : 5106439090},// tg.initDataUnsafe?.user,
        queryId: tg.initDataUnsafe?.query_id
    }
}