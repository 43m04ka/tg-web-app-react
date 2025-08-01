import React, {useState} from 'react';
import {useServer} from "../../../../hooks/useServer";
import {useNavigate} from "react-router-dom";
import useData from "./useData";

const ApAuthentication = () => {
    const {authentication} = useServer();
    const navigate = useNavigate();
    const {setAuthenticationData} = useData()

    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')

    const isAuth = (result) => {
        if(result) {
            navigate('/admin-panel');
            setAuthenticationData({login:login, password:password})
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: String(window.innerHeight / 2 - 100) + 'px'
        }}>
            <div className={'text-element'} style={{margin: '5px', fontSize: '20px'}}>Регистрация</div>
            <div style={{display: 'flex'}}>
                <input onChange={(event) => setLogin(event.target.value)}
                       style={{
                           margin: '5px',
                           borderRadius: '100px',
                           padding: '5px',
                           border: '0px',
                           fontSize: '20px',
                           textAlign: 'center'
                       }}
                       placeholder={'Введите логин'}/>
            </div>
            <div style={{display: 'flex'}}>
                <input onChange={(event) => setPassword(event.target.value)}
                       style={{
                           margin: '5px',
                           borderRadius: '100px',
                           padding: '5px',
                           border: '0px',
                           fontSize: '20px',
                           textAlign: 'center'
                       }} placeholder={'Введите пароль'}/>
            </div>
            <button onClick={async ()=>{await authentication({login:login, password:password}, isAuth)}} style={{
                margin: '5px',
                borderRadius: '100px',
                padding: '5px',
                border: '0px',
                width: '100px',
                fontSize: '20px'
            }}>Войти
            </button>
        </div>
    );
};

export default ApAuthentication;