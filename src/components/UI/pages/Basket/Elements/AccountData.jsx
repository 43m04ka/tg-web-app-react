import React, {useEffect} from 'react';

import style from './AccountData.module.scss';
import useGlobalData from "../../../../../hooks/useGlobalData";

const AccountData = ({returnAccountData}) => {

    const [selectNewAccount, setSelectNewAccount] = React.useState(true);
    const [inputData, setInputData] = React.useState(['Не указано', 'Не указано', 'Не указано', 'Не указано', 'Не указано']);
    const {pageId} = useGlobalData()

    const updateAccountData = () => {
        if (pageId === 20) {
            if (selectNewAccount) {
                returnAccountData('Нет своего аккаунта PSN.')
            } else {
                returnAccountData(`Логин: ${inputData[0]} \nПароль: ${inputData[1]} \nРезервные коды: ${inputData[2]}, ${inputData[3]}, ${inputData[4]}`);
            }
        }
        if (pageId === 28) {
            if (selectNewAccount) {
                returnAccountData('Нет своего аккаунта Xbox.')
            } else {
                returnAccountData(`Логин: ${inputData[0]} \nПароль: ${inputData[1]} \nРезервная почта: ${inputData[2]} \nРезервный телефон: ${inputData[3]}`);
            }
        }
    }

    const updateInputData = (index, value) => {
        let newValue = inputData;
        newValue[index] = value;
        setInputData(newValue);
        updateAccountData()
    }

    useEffect(() => {
        updateAccountData()
    }, [selectNewAccount]);

    let menuDesigns = null
    if ((pageId === 20 || pageId === 3) && selectNewAccount) {
        menuDesigns = (
            <div className={style['label']} style={{textAlign:'right'}}>
                Мы оформим заказ на новый аккаунт PSN и передадим Вам его в полном доступе.<br/> Аккаунт будет принадлежать только Вам.<br/> Это бесплатно.
            < /div>)
    } else if ((pageId === 20 || pageId === 3)) {
        menuDesigns = (<div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <div className={style['label']}>
                Введите данные от аккаунта PSN:
            </div>
            <input placeholder={'Логин от аккаунта PSN'}
                   className={style['input']} onChange={(event) => updateInputData(0, event.target.value)}/>
            <input placeholder={"Пароль от аккаунта PSN"}
                   className={style['input']} onChange={(event) => updateInputData(1, event.target.value)}/>
            <div className={style['label']}>Введите резервные коды от
                аккаунта PSN:
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <input placeholder={"Код #1"}
                       maxLength={6} style={{margin: '1vw 1vw 1vw 0'}}
                       className={style['input']} onChange={(event) => updateInputData(2, event.target.value)}/>
                <input placeholder={"Код #2"}
                       maxLength={6} style={{margin: '1vw'}}
                       className={style['input']} onChange={(event) => updateInputData(3, event.target.value)}/>
                <input placeholder={"Код #3"}
                       maxLength={6} style={{margin: '1vw 0 1vw 1vw'}}
                       className={style['input']} onChange={(event) => updateInputData(4, event.target.value)}/>
            </div>
            <a href={'https://t.me/gwstore_faq/10'}
               className={'link-element'}>
                <div className={style['label']} style={{fontSize: '2.5vw', color: '#559fff', marginBottom: '1vw'}}>
                    Где их взять и что это за коды? Инструкция по настройке.
                </div>
            </a>
        </div>)
    }

    if (pageId === 28 && selectNewAccount === true) {
        menuDesigns = (
            <div className={style['label']}  style={{textAlign:'right'}}>
                Мы оформим заказ на новый аккаунт Xbox и передадим Вам его в полном доступе. <br/> Это бесплатно.
            </div>)
    } else if (pageId === 28) {
        menuDesigns = (<div style={{display: 'flex', flexDirection: 'column',}}>
            <div className={style['label']}>
                Введите логин и пароль от аккаунта Xbox:
            </div>

            <input placeholder={"Введите логин от аккаунта Xbox"}
                   className={style['input']} onChange={(event) => updateInputData(0, event.target.value)}/>
            <input placeholder={"Введите пароль от аккаунта Xbox"}
                   className={style['input']} onChange={(event) => updateInputData(1, event.target.value)}/>

            <div className={style['label']}>
                Введите резервную почту или телефон от аккаунта Xbox. Это нужно чтобы отправить код для входа в аккаунт.
            </div>


            <input placeholder={"Резервная почта"}
                   className={style['input']} onChange={(event) => updateInputData(2, event.target.value)}/>
            <input placeholder={"Телефон"}
                   className={style['input']} onChange={(event) => updateInputData(3, event.target.value)}/>

            <a href={'https://t.me/gwstore_faq/9'}
               className={'link-element'}>
                <div className={style['label']} style={{fontSize: '2.5vw', color: '#559fff'}}>
                    Если этот параметр не настроен. Инструкция.
                </div>
            </a>
        </div>)
    }

    return (
        <div className={style['mainContainer']} style={{minHeight: (selectNewAccount ? '24.5vw' : '63.97vw')}}>
            <div className={style['selectPlace']}>
                <div style={{background: !selectNewAccount ? '#50A355' : 'none'}}
                     onClick={() => {
                         setSelectNewAccount(false)
                     }}>
                    <div style={{color: !selectNewAccount ? 'white' : '#575757'}}>На мой аккаунт</div>
                </div>
                <div style={{background: selectNewAccount ? '#50A355' : 'none'}}
                     onClick={() => {
                         setSelectNewAccount(true)
                     }}>
                    <div style={{color: selectNewAccount ? 'white' : '#575757'}}>Новый аккаунт</div>
                </div>
            </div>

            <div style={{
                marginTop: '2vw',
                marginBottom: '2vw'
            }}>{menuDesigns}</div>
        </div>
    );
};

export default AccountData;