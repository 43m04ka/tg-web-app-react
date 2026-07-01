import React, {useEffect, useMemo, useState} from 'react';

import style from './DesktopAccountData.module.scss';

const DesktopAccountData = ({returnAccountData, pageType}) => {
    const [selectNewAccount, setSelectNewAccount] = useState(true);
    const [inputData, setInputData] = useState(['Не указано', 'Не указано', 'Не указано', 'Не указано', 'Не указано']);

    const updateAccountData = () => {
        if (pageType === 'ps') {
            if (selectNewAccount) {
                returnAccountData('Нет своего аккаунта PSN.');
            } else {
                returnAccountData(`Логин: ${inputData[0]} \nПароль: ${inputData[1]} \nРезервные коды: ${inputData[2]}, ${inputData[3]}, ${inputData[4]}`);
            }
        }
        if (pageType === 'xbox') {
            if (selectNewAccount) {
                returnAccountData('Нет своего аккаунта Xbox.');
            } else {
                returnAccountData(`Логин: ${inputData[0]} \nПароль: ${inputData[1]} \nРезервная почта: ${inputData[2]} \nРезервный телефон: ${inputData[3]}`);
            }
        }
    };

    const updateInputData = (index, value) => {
        setInputData((prevState) => {
            const nextState = [...prevState];
            nextState[index] = value;
            return nextState;
        });
    };

    useEffect(() => {
        updateAccountData();
    }, [selectNewAccount, pageType, inputData]);

    const menuDesigns = useMemo(() => {
        if (pageType === 'ps' && selectNewAccount) {
            return (
                <div className={style.label}>
                    Мы оформим заказ на новый аккаунт PSN и передадим Вам его в полном доступе.<br/> Аккаунт будет принадлежать только Вам.<br/> Это бесплатно.
                </div>
            );
        }
        if (pageType === 'ps') {
            return (
                <div className={style.formBlock}>
                    <div className={style.label}>Введите данные от аккаунта PSN:</div>
                    <input placeholder="Логин от аккаунта PSN" className={style.input} onChange={(event) => updateInputData(0, event.target.value)}/>
                    <input placeholder="Пароль от аккаунта PSN" className={style.input} onChange={(event) => updateInputData(1, event.target.value)}/>
                    <div className={style.label}>Введите резервные коды от аккаунта PSN:</div>
                    <div className={style.codesRow}>
                        <input placeholder="Код #1" maxLength={6} className={style.codeInput} onChange={(event) => updateInputData(2, event.target.value)}/>
                        <input placeholder="Код #2" maxLength={6} className={style.codeInput} onChange={(event) => updateInputData(3, event.target.value)}/>
                        <input placeholder="Код #3" maxLength={6} className={style.codeInput} onChange={(event) => updateInputData(4, event.target.value)}/>
                    </div>
                    <a href="https://t.me/gwstore_faq/10" className="link-element">
                        <div className={style.linkLabel}>Где их взять и что это за коды? Инструкция по настройке.</div>
                    </a>
                </div>
            );
        }
        if (pageType === 'xbox' && selectNewAccount) {
            return (
                <div className={style.label}>
                    Мы оформим заказ на новый аккаунт Xbox и передадим Вам его в полном доступе. <br/> Это бесплатно.
                </div>
            );
        }
        return (
            <div className={style.formBlock}>
                <div className={style.label}>Введите логин и пароль от аккаунта Xbox:</div>
                <input placeholder="Введите логин от аккаунта Xbox" className={style.input} onChange={(event) => updateInputData(0, event.target.value)}/>
                <input placeholder="Введите пароль от аккаунта Xbox" className={style.input} onChange={(event) => updateInputData(1, event.target.value)}/>
                <div className={style.label}>
                    Введите резервную почту или телефон от аккаунта Xbox. Это нужно чтобы отправить код для входа в аккаунт.
                </div>
                <input placeholder="Резервная почта" className={style.input} onChange={(event) => updateInputData(2, event.target.value)}/>
                <input placeholder="Телефон" className={style.input} onChange={(event) => updateInputData(3, event.target.value)}/>
                <a href="https://t.me/gwstore_faq/9" className="link-element">
                    <div className={style.linkLabel}>Если этот параметр не настроен. Инструкция.</div>
                </a>
            </div>
        );
    }, [pageType, selectNewAccount]);

    return (
        <div className={style.mainContainer}>
            <div className={style.selectPlace}>
                <button className={style[!selectNewAccount ? 'activeButton' : 'noActiveButton']} onClick={() => setSelectNewAccount(false)}>
                    <div>На мой аккаунт</div>
                </button>
                <button className={style[selectNewAccount ? 'activeButton' : 'noActiveButton']} onClick={() => setSelectNewAccount(true)}>
                    <div>Новый аккаунт</div>
                </button>
            </div>
            <div className={style.contentBlock}>{menuDesigns}</div>
        </div>
    );
};

export default DesktopAccountData;
