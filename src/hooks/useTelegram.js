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
        user: tg.initDataUnsafe?.user || {id: 5106439090},
        queryId: tg.initDataUnsafe?.query_id
    }
}

//{id:5106439090, first_name:'tёma'},