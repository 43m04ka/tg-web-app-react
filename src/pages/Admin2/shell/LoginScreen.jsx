import React, {useState} from 'react';
import {confirmReconfirm, confirmSignIn, signIn, signOut, startReconfirm} from '../platform/session';
import {Button} from '../ui/primitives/Button';
import {Field, Input} from '../ui/primitives/Field';
import {Note} from '../ui/primitives/Feedback';
import style from './LoginScreen.module.scss';

export default function LoginScreen({reconfirm = false}) {
    const [step, setStep] = useState(reconfirm ? 'reconfirm' : 'credentials');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [ticket, setTicket] = useState('');
    const [attempts, setAttempts] = useState(null);
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
                setAttempts(result.attempts);
                setCode('');
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

    const requestReconfirm = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            const result = await startReconfirm();

            if (result.status === 'confirmation') {
                setTicket(result.ticket);
                setAttempts(result.attempts);
                setCode('');
                setStep('reconfirm-code');
            } else if (result.status !== 'signed') {
                setError('Сервер не прислал код');
            }
        } catch (failure) {
            setError(failure.message);
        } finally {
            setBusy(false);
        }
    };

    const submitReconfirm = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            const result = await confirmReconfirm({ticket, code: code.trim()});
            if (result.status !== 'signed') setError('Код не подошёл');
        } catch (failure) {
            setError(failure.message);

            if (failure.status === 401 && /заново|новый|устарел/.test(failure.message || '')) {
                setStep('reconfirm');
                setTicket('');
            }
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

            // Билет сгорел или устарел — возвращаем к логину, иначе человек будет
            // вводить коды в форму, которая уже ничего не примет
            if (failure.status === 401 && /заново/.test(failure.message || '')) {
                setStep('credentials');
                setTicket('');
                setPassword('');
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={style.screen}>
            <form
                className={style.card}
                onSubmit={{
                    credentials: submitCredentials,
                    confirmation: submitCode,
                    reconfirm: requestReconfirm,
                    'reconfirm-code': submitReconfirm,
                }[step]}
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

                {step === 'reconfirm' ? (
                    <Note tone="warning">
                        Этим входом не пользовались больше недели. Пароль вводить не нужно —
                        подтвердите вход кодом, который придёт в Telegram от бота Геймворд.
                    </Note>
                ) : null}

                {step === 'reconfirm-code' ? (
                    <>
                        <Note tone="accent">
                            Код отправлен в Telegram выбранным админам. Он действует пять минут
                            {attempts ? `, попыток — ${attempts}` : ''}.
                        </Note>
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
                ) : null}

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
                ) : null}

                {step === 'confirmation' ? (
                    <>
                        <Note tone="accent">
                            Шестизначный код отправлен в Telegram выбранным админам. Он действует пять минут
                            {attempts ? `, попыток — ${attempts}` : ''}.
                        </Note>
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
                ) : null}

                {error ? <Note tone="danger">{error}</Note> : null}

                <Button type="submit" variant="primary" block loading={busy}>
                    {{credentials: 'Войти', reconfirm: 'Отправить код'}[step] || 'Подтвердить'}
                </Button>

                {step === 'reconfirm' || step === 'reconfirm-code' ? (
                    <Button variant="ghost" block onClick={signOut}>
                        Выйти и войти по паролю
                    </Button>
                ) : null}

                {step === 'confirmation' ? (
                    <Button
                        variant="ghost"
                        block
                        onClick={() => {
                            setStep('credentials');
                            setTicket('');
                            setError('');
                        }}
                    >
                        Назад
                    </Button>
                ) : null}
            </form>
        </div>
    );
}
