import React from 'react';

import style from './AccountData.module.scss';
import useGlobalData from "../../../../../hooks/useGlobalData";

const AccountData = () => {

    const [selectNewAccount, setSelectNewAccount] = React.useState(true);
    const {pageId} = useGlobalData()

    let menuDesigns = null
    if ((pageId === 20 || pageId === 3) && selectNewAccount) {
        menuDesigns = (<div className={'text-element'}
                            style={{
                                textAlign: 'center',
                                marginTop: '5px',
                                lineHeight: '18px',
                                fontWeight: '500',
                                fontSize: '13px',
                                paddingLeft: '10px',
                                paddingRight: '10px'
                            }}>Мы оформим заказ на новый аккаунт PSN и передадим Вам его в полном доступе. Это
            бесплатно.< /div>)
    } else if ((pageId === 20 || pageId === 3)) {
        menuDesigns = (<div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        }}>
            <div className={'text-element'} style={{fontSize: '14px', fontWeight: '500'}}>Введите данные от аккаунта
                PSN:
            </div>
            <input placeholder={'Логин от аккаунта PSN'}
                   style={{
                       height: '34px',
                       width: String(window.innerWidth - 50) + 'px',
                       marginTop: '7px',
                       borderRadius: '17px',
                       background: 'white',
                       textAlign: 'center',
                       border: '0px',
                       fontSize: '16px',
                       color: 'black',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[0] = event.target.value}/>
            <input placeholder={"Пароль от аккаунта PSN"}
                   style={{
                       height: '34px',
                       width: String(window.innerWidth - 50) + 'px',
                       marginTop: '7px',
                       marginBottom: '10px',
                       borderRadius: '17px',
                       background: 'white',
                       textAlign: 'center',
                       textWrap: 'wrap',
                       border: '0px',
                       fontSize: '16px',
                       color: 'black',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[1] = event.target.value}/>
            <div className={'text-element'} style={{fontSize: '14px', fontWeight: '500'}}>Введите резервные коды от
                аккаунта PSN:
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <input placeholder={"Код #1"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 64) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           border: '0px',
                           fontSize: '18px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[2] = event.target.value}/>
                <input placeholder={"Код #2"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 64) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           marginLeft: '7px',
                           marginRight: '7px',
                           border: '0px',
                           fontSize: '18px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[3] = event.target.value}/>
                <input placeholder={"Код #3"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 64) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           border: '0px',
                           fontSize: '18px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[4] = event.target.value}/>
            </div>
            <a href={'https://t.me/gwstore_faq/10'}
               className={'link-element'}>
                <div className={'text-element'} style={{fontSize: '9px', color: '#559fff', marginBottom: '3px'}}>Где их
                    взять и что это за
                    коды? Инструкция по
                    настройке.
                </div>
            </a>
        </div>)
    }

    if (pageId === 28 && selectNewAccount === true) {
        menuDesigns = (<div className={'text-element'}
                            style={{
                                textAlign: 'center',
                                marginTop: '5px',
                                lineHeight: '18px',
                                fontWeight: '500',
                                fontSize: '13px',
                                paddingLeft: '10px',
                                paddingRight: '10px'
                            }}>Мы оформим заказ на новый аккаунт Xbox и передадим Вам его в полном доступе. Это
            бесплатно.< /div>)
    } else if (pageId === 28) {
        menuDesigns = (<div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '5px',
            overflow: 'hidden',
        }}>
            <div className={'text-element'} style={{fontSize: '14px', fontWeight: '500'}}>Введите логин и пароль от
                аккаунта Xbox:
            </div>
            <input placeholder={"Введите логин от аккаунта Xbox"}
                   style={{
                       height: '34px',
                       width: String(window.innerWidth - 50) + 'px',
                       marginTop: '10px',
                       borderRadius: '17px',
                       background: 'white',
                       textAlign: 'center',
                       border: '0px',
                       fontSize: '16px',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[0] = event.target.value}/>
            <input placeholder={"Введите пароль от аккаунта Xbox"}
                   style={{
                       height: '34px',
                       width: String(window.innerWidth - 50) + 'px',
                       marginTop: '7px',
                       marginBottom: '10px',
                       borderRadius: '17px',
                       background: 'white',
                       textAlign: 'center',
                       textWrap: 'wrap',
                       border: '0px',
                       fontSize: '16px',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[1] = event.target.value}/>
            <div className={'text-element'} style={{
                fontSize: '12px',
                textAlign: 'center',
                paddingLeft: '10px',
                paddingRight: '10px',
                fontWeight: '500'
            }}>Введите резервную почту или
                телефон от аккаунта Xbox. Это нужно чтобы отправить код для входа в аккаунт.
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <input placeholder={"Резервная почта"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 58) / 2) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           border: '0px',
                           marginRight: '4px',
                           fontSize: '16px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[2] = event.target.value}/>
                <input placeholder={"Телефон"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 58) / 2) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           border: '0px',
                           marginLeft: '4px',
                           fontSize: '16px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[3] = event.target.value}/>
            </div>
            <a href={'https://t.me/gwstore_faq/9'}
               className={'link-element'}>
                <div className={'text-element'} style={{fontSize: '9px', color: '#559fff'}}>Если этот параметр не
                    настроен. Инструкция.
                </div>
            </a>
        </div>)
    }

    return (
        <div className={style['mainContainer']}>

            <div className={style['title']}>Куда оформить заказ?</div>
            <div className={style['selectPlace']}>
                <div style={{background: !selectNewAccount ? '#77A246' : 'none'}} onClick={() => setSelectNewAccount(false)}>
                    <div style={{color: !selectNewAccount ? 'white' : '#575757'}}>На мой аккаунт</div>
                </div>
                <div style={{background: selectNewAccount ? '#77A246' : 'none'}} onClick={() => setSelectNewAccount(true)}>
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