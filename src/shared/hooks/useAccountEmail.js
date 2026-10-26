import {useEffect} from 'react';
import {useSessionStore} from '../../store/useSessionStore';

export function useAccountEmail(setEmail) {
    const accountEmail = useSessionStore((state) => state.account?.email || '');

    useEffect(() => {
        if (accountEmail) setEmail((current) => current || accountEmail);
    }, [accountEmail, setEmail]);
}
