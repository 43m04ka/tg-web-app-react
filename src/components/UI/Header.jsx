import React from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import '../styles/style.css';

const Header = () => {
    const {tg, user, onCloce} = useTelegram()

    return (
        <div className={"header"}>
        </div>
    );
};

export default Header;