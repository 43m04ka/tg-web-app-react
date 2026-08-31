import {useEffect} from 'react';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {applyTheme} from '../lib/theme';

export function useAccentTheme() {
    const pageId = useSessionStore((state) => state.pageId);
    const startPages = useStructureStore((state) => state.startPages);

    const color = startPages?.find((item) => item.structurePageId === pageId)?.color;

    useEffect(() => {
        applyTheme(color);
    }, [color]);
}
