import {useEffect} from 'react';
import {applyStoreTheme} from '../../shared/lib/theme';

export function useDesktopAccent() {
    useEffect(() => {
        applyStoreTheme();
    }, []);
}
