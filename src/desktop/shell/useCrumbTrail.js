import {useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {cleanPath} from '../../pages/Main/catalogSections';
import {catalogRoute} from '../../shared/lib/pageRoutes';
import {navLabel} from '../model/desktopNav';
import {regionLabel} from '../../shared/lib/region';
import {useStorefrontScope} from './StorefrontScope';

export function useCrumbTrail({catalogId = null, catalogPath = null, current = null} = {}) {
    const navigate = useNavigate();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);
    const structureBlocks = useStructureStore((store) => store.structureBlocks);
    const setPageId = useSessionStore((store) => store.setPageId);
    const {setScopeId} = useStorefrontScope();

    const openHome = useCallback(() => {
        setScopeId(null);
        navigate('/');
    }, [navigate, setScopeId]);

    const openStorefront = useCallback((pageId) => {
        setScopeId(pageId);
        setPageId(pageId);
        navigate('/');
    }, [navigate, setPageId, setScopeId]);

    return useMemo(() => {
        const catalog = (catalogs || []).find((item) => (catalogId !== null
            ? item.id === catalogId
            : cleanPath(item.path) === cleanPath(catalogPath))) || null;

        const trail = [{key: 'home', label: 'Главная', onClick: openHome}];

        const pageId = catalog?.structurePageId ?? null;
        const page = pageId === null ? null : (pages || []).find((item) => item.id === pageId) || null;

        if (page) {
            const startPage = (startPages || []).find((item) => item.structurePageId === pageId) || null;

            trail.push({
                key: `page:${pageId}`,
                label: navLabel(page.type, regionLabel(page, startPage)),
                onClick: () => openStorefront(pageId)
            });
        }

        const path = catalog ? cleanPath(catalog.path) : null;
        const block = path
            ? (structureBlocks || []).find((item) => cleanPath(item.path) === path && String(item.name || '').trim())
            : null;

        if (block && current) {
            trail.push({key: `catalog:${path}`, label: block.name.trim(), onClick: () => navigate(catalogRoute(path))});
        }

        const last = current || block?.name?.trim() || null;
        if (last) trail.push({key: 'current', label: last, onClick: null});

        return trail;
    }, [catalogs, catalogId, catalogPath, pages, startPages, structureBlocks, current, navigate, openHome, openStorefront]);
}
