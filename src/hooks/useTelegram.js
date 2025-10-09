const tg = window.Telegram.WebApp;

export function useTelegram() {
    const onCloce = () => {
        tg.close();
    }

    const onToggleButton = () => {
        if(tg.MainButton.isVisible){
            tg.MainButton.hide();
        }else{
            tg.MainButton.show();
        }
    }

    return{
        onCloce,
        onToggleButton,
        tg,
        user: {id:8116988141}, //tg.initDataUnsafe?.user,
        queryId: tg.initDataUnsafe?.query_id
    }
}

//{id:8116988141},