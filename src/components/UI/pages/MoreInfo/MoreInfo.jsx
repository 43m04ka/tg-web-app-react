import React, {useCallback, useEffect} from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import style from './MoreInfo.module.scss'

const MoreInfo = () => {
    const {tg} = useTelegram();
    const navigate = useNavigate();

    const onBack = useCallback(() => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.BackButton.show();
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    return (<div className={style['container']}>
        <div >
            <div>
                <div>
                    <div/>
                    <p>Мои</p>
                    <p>покупки</p>
                </div>
                <div>
                    <div/>
                    <p>Избранное</p>
                </div>
            </div>
            <div>
                <div>
                    <div/>
                    <p>Мой</p>
                    <p>кэшбек</p>
                </div>
                <div>
                    <div/>
                    <p>Поддержка</p>
                </div>
            </div>
        </div>




    </div>);
};

export default MoreInfo;