import React from 'react';
import {useTelegram} from "../../hooks/useTelegram";

const Header = () => {
    const {tg, user, onCloce} = useTelegram()

    return (
        <div className={"header"}>
            <button onClick={onCloce}>Закрыть</button>
            <span className={'username'}>
                {user?.username}
            </span>
            
        </div>
    );
};

export default Header;