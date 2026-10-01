import {useCallback, useContext, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {menuLinks} from '../../shared/textPages/textPageModel';
import {useTextPageLinks} from '../../shared/textPages/useTextPages';
import {resetSearchState} from '../../shared/lib/searchMemory';
import {sectionList, storefrontList} from '../model/desktopNav';
import {menuGroups, menuTarget} from '../model/menuModel';
import {ScrollAreaContext} from './ScrollAreaContext';
import {useStorefrontScope} from './StorefrontScope';
import {useOpenSections} from './MaintenanceScope';

export function useSiteMenu() {
    const navigate = useNavigate();
    const {pathname, search} = useLocation();
    const areaRef = useContext(ScrollAreaContext);
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);
    const blocks = useStructureStore((store) => store.structureBlocks);
    const setPageId = useSessionStore((store) => store.setPageId);
    const {setScopeId} = useStorefrontScope();

    const storefronts = useMemo(() => storefrontList(startPages, pages, botType), [startPages, pages, botType]);
    const allSections = useMemo(() => sectionList(startPages, pages, botType), [startPages, pages, botType]);
    const sections = useOpenSections(allSections);
    const textPages = useTextPageLinks();
    const pageLinks = useMemo(() => menuLinks(textPages), [textPages]);

    const groups = useMemo(
        () => menuGroups({storefronts, sections, catalogs, blocks, pageLinks}),
        [storefronts, sections, catalogs, blocks, pageLinks]
    );

    const select = useCallback((item) => {
        if (item.action === 'storefront' || item.action === 'scoped') {
            setScopeId(item.shop.id);
            setPageId(item.shop.id);
        } else if (item.action === 'section') {
            setPageId(item.section.pageId);
        }

        const target = menuTarget(item);

        if (target === `${pathname}${search}`) {
            areaRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
            return;
        }

        if (pathname === '/search') resetSearchState();
        navigate(target);
    }, [areaRef, navigate, pathname, search, setPageId, setScopeId]);

    return {groups, select};
}
