import {useSessionStore} from '../../store/useSessionStore';
import {setAuthToken} from './authToken';
import {authenticate} from './authenticate';

export const LOGIN_REQUIRED_MESSAGE = 'Войдите, чтобы оформить заказ';

const loginRequired = () => ({ok: false, httpStatus: 401, code: 'AUTH_REQUIRED', error: LOGIN_REQUIRED_MESSAGE});

const refreshSession = async () => {
    setAuthToken(null);
    const account = await authenticate().catch(() => null);
    if (account) useSessionStore.getState().setAccount(account);
};

export const withLogin = (send) => async (payload) => {
    const state = useSessionStore.getState();

    if (state.account?.kind !== 'user') {
        state.openLogin('order');
        return loginRequired();
    }

    const result = await send(payload);

    if (result?.httpStatus === 401) {
        if (result.code === 'SESSION_INVALID') await refreshSession();
        useSessionStore.getState().openLogin('order');
        return loginRequired();
    }

    return result;
};
