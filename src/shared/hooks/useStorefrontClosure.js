import {useLocation} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {sectionTitleOf} from '../lib/maintenance';

export function useStorefrontClosure(sections) {
    const location = useLocation();
    const selectedId = useSessionStore((s) => s.pageId);
    const pages = useStructureStore((s) => s.maintenancePages);
    const rawCatalogs = useStructureStore((s) => s.maintenanceCatalogs);
    const store = new URLSearchParams(location.search).get('store');
    if (!store && !/^\/(main|catalog|card|basket|checkout|subscription)(\/|$)/.test(location.pathname)) return null;
    const catalogId = location.pathname.match(/^\/catalog\/([^/]+)/)?.[1];
    const catalogPage = (rawCatalogs || []).find((c) => String(c.id) === catalogId)?.structurePageId;
    const page = (pages || []).find((p) => String(p.id) === String(store || catalogPage || selectedId));
    const state = sections?.[page?.type];
    return state ? {id: page.type, title: sectionTitleOf(page.type), until: state.until} : null;
}
