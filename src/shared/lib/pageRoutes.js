export const STANDALONE_PAGES = {
    steam: '/steam',
    services: '/services'
};

export const standaloneRoute = (pageType) => STANDALONE_PAGES[pageType] || null;

export const isStandalonePage = (pageType) => Boolean(STANDALONE_PAGES[pageType]);

export const pageTypeOf = (pages, pageId) =>
    (pages || []).find((page) => page.id === pageId)?.type || null;
