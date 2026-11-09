import {useEffect} from 'react';
import {applyStoreTheme} from '../lib/theme';

export function useAccentTheme(enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        applyStoreTheme();
    }, [enabled]);
}
