import React, {useState} from 'react';
import {confirmReconfirm, confirmSignIn, signIn, signOut, startReconfirm} from '../platform/session';
import {adminTitle} from '../modules/access/accessModel';
import {Button} from '../ui/primitives/Button';
import {Field, Input} from '../ui/primitives/Field';
import {Note} from '../ui/primitives/Feedback';
import style from './LoginScreen.module.scss';

const LAST_RECIPIENT_KEY = 'gw-admin2-code-recipient';

const readLastRecipient = () => {
    try {
        return window.localStorage.getItem(LAST_RECIPIENT_KEY) || '';
    } catch {
        return '';
    }
};

const rememberRecipient = (chatId) => {
    try {
        window.localStorage.setItem(LAST_RECIPIENT_KEY, String(chatId));
    } catch {
        void 0;
    }
};

const orderAdmins = (admins, last) => [...admins].sort((left, right) => (
    Number(String(right.chatId) === last) - Number(String(left.chatId) === last)
));

export default function LoginScreen({reconfirm = false}) {
    const [step, setStep] = useState(reconfirm ? 'reconfirm' : 'credentials');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [ticket, setTicket] = useState('');
    const [attempts, setAttempts] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [sentTo, setSentTo] = useState(null);
    const [sending, setSending] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const reconfirming = step.startsWith('reconfirm');

    const accept = (result, recipient) => {
        if (result.status === 'pick') {
            setAdmins(orderAdmins(result.admins, readLastRecipient()));
            setStep(reconfirming ? 'reconfirm-pick' : 'pick');
            return;
        }

        if (result.status === 'confirmation') {
            if (recipient) rememberRecipient(recipient.chatId);
            setSentTo(recipient || null);
            setTicket(result.ticket);
            setAttempts(result.attempts);
            setCode('');
            setStep(reconfirming ? 'reconfirm-code' : 'confirmation');
            return;
        }

        if (result.status !== 'signed') setError(reconfirming ? 'Сервер не прислал код' : 'Сервер не выдал токен');
    };

    const request = async (recipient) => {
        setBusy(true);
        setSending(recipient ? String(recipient.chatId) : '');
        setError('');

        try {
            const chatId = recipient ? recipient.chatId : undefined;
            const result = reconfirming
                ? await startReconfirm({recipient: chatId})
                : await signIn({login: login.trim(), password, recipient: chatId});

            accept(result, recipient);
        } catch (failure) {
            setError(!reconfirming && failure.status === 401 ? 'Логин или пароль не подходят' : failure.message);
        } finally {
            setBusy(false);
            setSending('');
        }
    };

    const submitCode = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            const result = reconfirming
                ? await confirmReconfirm({ticket, code: code.trim()})
                : await confirmSignIn({ticket, code: code.trim(), login: login.trim()});

            if (result.status !== 'signed') setError('Код не подошёл');
        } catch (failure) {
            setError(failure.message);

            if (failure.status === 401 && /заново|новый|устарел/.test(failure.message || '')) {
                setTicket('');

                if (reconfirming) {
                    setStep('reconfirm');
                } else {
                    setStep('credentials');
                    setPassword('');
                }
            }
        } finally {
            setBusy(false);
        }
    };

    const back = () => {
        setTicket('');
        setError('');
        setStep(reconfirming ? 'reconfirm' : 'credentials');
    };

    const onSubmit = (event) => {
        event.preventDefault();

        if (step === 'credentials' || step === 'reconfirm') request(null);
        else if (step === 'confirmation' || step === 'reconfirm-code') submitCode(event);
    };

    const picking = step === 'pick' || step === 'reconfirm-pick';
    const entering = step === 'confirmation' || step === 'reconfirm-code';

    return (
        <div className={style.screen}>
            <form className={style.card} onSubmit={onSubmit}>
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

                {picking ? (
                    <div className={style.pick}>
                        <span className={style.pickLabel}>Кому прислать код</span>
                        {admins.map((admin, index) => (
                            <Button
                                key={admin.chatId}
                                variant={index === 0 ? 'primary' : 'secondary'}
                                block
                                disabled={busy && sending !== String(admin.chatId)}
                                loading={sending === String(admin.chatId)}
                                onClick={() => request(admin)}
                            >
                                {adminTitle(admin)}
                            </Button>
                        ))}
                    </div>
                ) : null}

                {entering ? (
                    <>
                        <Note tone="accent">
                            Шестизначный код отправлен в Telegram
                            {sentTo ? ` — ${adminTitle(sentTo)}` : ''}. Он действует пять минут
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

                {picking ? null : (
                    <Button type="submit" variant="primary" block loading={busy}>
                        {{credentials: 'Войти', reconfirm: 'Получить код'}[step] || 'Подтвердить'}
                    </Button>
                )}

                {picking || step === 'confirmation' ? (
                    <Button variant="ghost" block onClick={step === 'confirmation' && admins.length > 1 ? () => setStep('pick') : back}>
                        Назад
                    </Button>
                ) : null}

                {step === 'reconfirm-code' && admins.length > 1 ? (
                    <Button variant="ghost" block onClick={() => setStep('reconfirm-pick')}>
                        Отправить другому админу
                    </Button>
                ) : null}

                {reconfirming ? (
                    <Button variant="ghost" block onClick={signOut}>
                        Выйти и войти по паролю
                    </Button>
                ) : null}
            </form>
        </div>
    );
}
