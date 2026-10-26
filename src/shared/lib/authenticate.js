import {openSession, signInTelegram, signInVk} from '../api/auth';
import {setAuthToken} from './authToken';
import {getVkLaunchParams, isVk} from './platform';

const accept = (result) => {
    if (!result?.ok || !result.token || !result.user) return null;
    setAuthToken(result.token);
    return result.user;
};

export async function authenticate(signal) {
    const initData = window.Telegram?.WebApp?.initData;

    if (initData) {
        const user = accept(await signInTelegram(initData, signal).catch(() => null));
        if (user) return user;
    }

    if (isVk()) {
        const launch = getVkLaunchParams();
        if (launch?.sign) {
            const user = accept(await signInVk(launch, signal).catch(() => null));
            if (user) return user;
        }
    }

    let user = accept(await openSession(signal));
    if (!user) {
        setAuthToken(null);
        user = accept(await openSession(signal));
    }

    return user;
}
