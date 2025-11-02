import React from 'react';

import style from './AccountData.module.scss';
import useGlobalData from "../../../../../hooks/useGlobalData";

const AccountData = () => {

    const [selectNewAccount, setSelectNewAccount] = React.useState(true);
    const {pageId} = useGlobalData()

    let menuDesigns = null
    if ((pageId === 20 || pageId === 3) && selectNewAccount) {
        menuDesigns = (
            <div className={style['label']}>
                Мы оформим заказ на новый аккаунт PSN и передадим Вам его в полном доступе.
                Это бесплатно.
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
                   className={style['input']} onChange={(event) => inputData[0] = event.target.value}/>
            <input placeholder={"Пароль от аккаунта PSN"}
                   className={style['input']} onChange={(event) => inputData[1] = event.target.value}/>
            <div className={style['label']}>Введите резервные коды от
                аккаунта PSN:
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <input placeholder={"Код #1"}
                       maxLength={6} style={{margin: '1vw 1vw 1vw 0'}}
                       className={style['input']} onChange={(event) => inputData[2] = event.target.value}/>
                <input placeholder={"Код #2"}
                       maxLength={6} style={{margin: '1vw'}}
                       className={style['input']} onChange={(event) => inputData[3] = event.target.value}/>
                <input placeholder={"Код #3"}
                       maxLength={6} style={{margin: '1vw 0 1vw 1vw'}}
                       className={style['input']} onChange={(event) => inputData[4] = event.target.value}/>
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
            <div className={style['label']}>
                Мы оформим заказ на новый аккаунт Xbox и передадим Вам его в полном доступе. Это бесплатно.
            </div>)
    } else if (pageId === 28) {
        menuDesigns = (<div style={{display: 'flex', flexDirection: 'column',}}>
            <div className={style['label']}>
                Введите логин и пароль от аккаунта Xbox:
            </div>

            <input placeholder={"Введите логин от аккаунта Xbox"}
                   className={style['input']} onChange={(event) => inputData[0] = event.target.value}/>
            <input placeholder={"Введите пароль от аккаунта Xbox"}
                   className={style['input']} onChange={(event) => inputData[1] = event.target.value}/>

            <div className={style['label']}>
                Введите резервную почту или телефон от аккаунта Xbox. Это нужно чтобы отправить код для входа в аккаунт.
            </div>


            <input placeholder={"Резервная почта"}
                   className={style['input']} onChange={(event) => inputData[2] = event.target.value}/>
            <input placeholder={"Телефон"}
                   className={style['input']} onChange={(event) => inputData[3] = event.target.value}/>

            <a href={'https://t.me/gwstore_faq/9'}
               className={'link-element'}>
                <div className={style['label']} style={{fontSize: '2.5vw', color: '#559fff'}}>
                    Если этот параметр не настроен. Инструкция.
                </div>
            </a>
        </div>)
    }

    return (
        <div className={style['mainContainer']}>

            <div className={style['title']}>Куда оформить заказ?</div>
            <div className={style['selectPlace']}>
                <div style={{background: !selectNewAccount ? '#77A246' : 'none'}}
                     onClick={() => setSelectNewAccount(false)}>
                    <div style={{color: !selectNewAccount ? 'white' : '#575757'}}>На мой аккаунт</div>
                </div>
                <div style={{background: selectNewAccount ? '#77A246' : 'none'}}
                     onClick={() => setSelectNewAccount(true)}>
                    <div style={{color: selectNewAccount ? 'white' : '#575757'}}>Новый аккаунт</div>
                </div>
            </div>

            <div style={{
                transitionProperty: 'height',
                transitionDuration: '0.2s',
                marginTop: '7px',
                marginBottom: '7px'
            }}>{menuDesigns}</div>
        </div>
    );
};

export default AccountData;