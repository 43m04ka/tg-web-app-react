import React, {useState} from 'react';
import {confirmSignIn, signIn} from '../platform/session';
import {Button} from '../ui/primitives/Button';
import {Field, Input} from '../ui/primitives/Field';
import {Note} from '../ui/primitives/Feedback';
import style from './LoginScreen.module.scss';

export default function LoginScreen() {
    const [step, setStep] = useState('credentials');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [ticket, setTicket] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submitCredentials = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            const result = await signIn({login: login.trim(), password});

            if (result.status === 'confirmation') {
                setTicket(result.ticket);
                setStep('confirmation');
            } else if (result.status !== 'signed') {
                setError('Сервер не выдал токен');
            }
        } catch (failure) {
            setError(failure.status === 401 ? 'Логин или пароль не подходят' : failure.message);
        } finally {
            setBusy(false);
        }
    };

    const submitCode = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            const result = await confirmSignIn({ticket, code: code.trim(), login: login.trim()});
            if (result.status !== 'signed') setError('Код не подошёл');
        } catch (failure) {
            setError(failure.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={style.screen}>
            <form
                className={style.card}
                onSubmit={step === 'credentials' ? submitCredentials : submitCode}
            >
                <div className={style.head}>
                    <span className={style.mark}>GW</span>
                    <div className={style.heading}>
                        <h1 className={style.title}>Админка</h1>
                        <span className={style.subtitle}>
                            {step === 'credentials' ? 'Вход в админку' : 'Подтверждение входа'}
                        </span>
                    </div>
                </div>

                {step === 'credentials' ? (
                    <>
                        <Field label="Логин">
                            <Input
                                value={login}
                                autoFocus
                                autoComplete="username"
                                onChange={(event) => setLogin(event.target.value)}
                            />
                        </Field>
                        <Field label="Пароль">
                            <Input
                                type="password"
                                value={password}
                                autoComplete="current-password"
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </Field>
                    </>
                ) : (
                    <>
                        <Note tone="accent">Код отправлен в Telegram, он действует несколько минут</Note>
                        <Field label="Код подтверждения">
                            <Input
                                value={code}
                                autoFocus
                                inputMode="numeric"
                                mono
                                onChange={(event) => setCode(event.target.value)}
                            />
                        </Field>
                    </>
                )}

                {error ? <Note tone="danger">{error}</Note> : null}

                <Button type="submit" variant="primary" block loading={busy}>
                    {step === 'credentials' ? 'Войти' : 'Подтвердить'}
                </Button>

                {step === 'confirmation' ? (
                    <Button variant="ghost" block onClick={() => setStep('credentials')}>Назад</Button>
                ) : null}
            </form>
        </div>
    );
}
