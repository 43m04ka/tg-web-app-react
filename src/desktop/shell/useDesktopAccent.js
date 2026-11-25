import {useEffect} from 'react';
import {applyTheme} from '../../shared/lib/theme';

export function useDesktopAccent() {
    useEffect(() => {
        applyTheme('#8bdc78');
    }, []);
}
