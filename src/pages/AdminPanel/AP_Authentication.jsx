import React, {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useServer} from './legacy/useServer';
import useData from './useData';
import useAdminTheme from './useAdminTheme';
import './styles/adminFonts.css';
import style from './AP_Authentication.module.scss';

const sunIcon = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4"/>
        <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            strokeLinecap="round"/>
    </svg>
);

const moonIcon = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const eyeIcon = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="2.8"/>
    </svg>
);

const eyeOffIcon = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
            d="M10.6 6.7A9.9 9.9 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a18 18 0 0 1-3.3 4.1M6.2 8.1A17.7 17.7 0 0 0 2 12s3.6 6.5 10 6.5a9.7 9.7 0 0 0 3.6-.66"
            strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" strokeLinecap="round"/>
    </svg>
);

const ApAuthentication = () => {
    const {authentication} = useServer();
    const navigate = useNavigate();
    const {setAuthenticationData} = useData();
    const {theme, toggleTheme} = useAdminTheme();

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordShown, setPasswordShown] = useState(false);
    const [isCapsOn, setCapsOn] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isLoading) return;

        const credentials = {login: login.trim(), password};
        if (!credentials.login || !credentials.password) {
            setError('Заполните логин и пароль');
            return;
        }

        setError('');
        setIsLoading(true);
        await authentication(credentials, (result) => {
            if (!result) {
                setError('Неверный логин или пароль');
                setIsLoading(false);
                return;
            }
            setAuthenticationData(credentials);
            navigate('/admin-panel');
        });
    };

    const trackCapsLock = useCallback((event) => {
        if (typeof event.getModifierState !== 'function') return;
        setCapsOn(event.getModifierState('CapsLock'));
    }, []);

    return (
        <div className={style.screen} data-theme={theme}>
            <div className={style.backdrop} aria-hidden="true"/>

            <button
                type="button"
                className={style.themeToggle}
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
                {theme === 'dark' ? sunIcon : moonIcon}
            </button>

            <div className={style.layout}>
                <aside className={style.brand}>
                    <div className={style.brandMark} aria-hidden="true">GW</div>
                    <h1 className={style.brandTitle}>Админ-панель</h1>
                    <p className={style.brandText}>
                        Управление каталогами, ценами, заказами и витринами магазина.
                        Доступ по служебной учётной записи.
                    </p>
                    <dl className={style.facts}>
                        <div className={style.fact}>
                            <dt>Сервер</dt>
                            <dd>gwstorebot.ru</dd>
                        </div>
                        <div className={style.fact}>
                            <dt>Доступ</dt>
                            <dd>Только персонал</dd>
                        </div>
                    </dl>
                </aside>

                <main className={style.panel}>
                    <div className={style.panelHead}>
                        <span className={style.eyebrow}>Вход в систему</span>
                        <h2 className={style.panelTitle}>Авторизация</h2>
                    </div>

                    <form className={style.form} onSubmit={handleSubmit} noValidate>
                        <fieldset className={style.fields} disabled={isLoading}>
                            <label className={style.field}>
                                <span className={style.label}>Логин</span>
                                <input
                                    type="text"
                                    className={style.input}
                                    placeholder="admin"
                                    value={login}
                                    autoComplete="username"
                                    autoFocus
                                    spellCheck="false"
                                    autoCapitalize="none"
                                    onChange={(event) => {
                                        setLogin(event.target.value);
                                        setError('');
                                    }}
                                />
                            </label>

                            <label className={style.field}>
                                <span className={style.label}>Пароль</span>
                                <span className={style.inputWrap}>
                                    <input
                                        type={isPasswordShown ? 'text' : 'password'}
                                        className={`${style.input} ${style.inputPassword}`}
                                        placeholder="••••••••"
                                        value={password}
                                        autoComplete="current-password"
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setError('');
                                        }}
                                        onKeyUp={trackCapsLock}
                                        onKeyDown={trackCapsLock}
                                        onBlur={() => setCapsOn(false)}
                                    />
                                    <button
                                        type="button"
                                        className={style.reveal}
                                        onClick={() => setPasswordShown((prev) => !prev)}
                                        tabIndex={-1}
                                        aria-label={isPasswordShown ? 'Скрыть пароль' : 'Показать пароль'}
                                        title={isPasswordShown ? 'Скрыть пароль' : 'Показать пароль'}
                                    >
                                        {isPasswordShown ? eyeOffIcon : eyeIcon}
                                    </button>
                                </span>
                                {isCapsOn && <span className={style.hint}>Включён Caps Lock</span>}
                            </label>
                        </fieldset>

                        <div className={style.status} role="status" aria-live="polite">
                            {error && (
                                <p className={style.error}>
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                                         strokeWidth="2" aria-hidden="true">
                                        <circle cx="12" cy="12" r="9"/>
                                        <path d="M12 7.5v5.5M12 16.2v.2" strokeLinecap="round"/>
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={style.submit}
                            disabled={isLoading || !login.trim() || !password}
                        >
                            <span>{isLoading ? 'Проверяем…' : 'Войти'}</span>
                            {isLoading && <span className={style.progress} aria-hidden="true"/>}
                        </button>
                    </form>

                    <p className={style.legal}>Действия в панели фиксируются в журнале.</p>
                </main>
            </div>
        </div>
    );
};

export default ApAuthentication;
