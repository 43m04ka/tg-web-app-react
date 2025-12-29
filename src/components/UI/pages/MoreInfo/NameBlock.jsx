import React from 'react';
import style from "./MoreInfo.module.scss";
import {useTelegram} from "../../../../hooks/useTelegram";

const NameBlock = () => {

    const {tg} = useTelegram()
    console.log(tg)

    return (
        <div>

        </div>
    );
};

export default NameBlock;