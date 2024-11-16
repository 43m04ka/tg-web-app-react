import React from 'react';

const Header = () => {
    const tg = window.Telegram.WebApp;
    const onCloce = () => {
        tg.close();
    }
    return (
        <div className={"header"}>
            <button onClick={onCloce}>Закрыть</button>
            <span className={'username'}>
                {tg.initDataUnsafe?.user?.username}
            </span>
            
        </div>
    );
};

export default Header;