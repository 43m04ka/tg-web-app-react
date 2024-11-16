const tg = window.Telegram.WebApp;

export  function useTelegram() {
    const onCloce = () => {
        tg.close();
    }

    const onToggleButton = () => {
        if(tg.MainButton.isVisible()){
            tg.MainButton.show();
        }else{
            tg.MainButton.hide();
        }
    }

    return{
        onCloce,
        onToggleButton,
        tg,
        user: tg.initDataUnsafe?.user
    }

}