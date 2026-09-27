import {create} from 'zustand';
import {INITIAL_DATA, hasItems} from '../shared/lib/initialData';
import {
    fetchBanners,
    fetchCatalogs,
    fetchInfoBlocks,
    fetchMainPageProducts,
    fetchPages,
    fetchPopularProducts,
    fetchStartPages,
    fetchStructureBlocks
} from '../shared/api/structure';

const visibleOnly = (pages) => (Array.isArray(pages) ? pages.filter((page) => page.isHidden !== 1) : null);

const withoutPattern = (items) =>
    Array.isArray(items) ? items.map(({pattern, ...rest}) => rest) : null;

const SOURCES = [
    {key: 'pages', initial: 'pages', load: fetchPages, transform: visibleOnly, critical: true},
    {key: 'startPages', initial: 'startPages', load: fetchStartPages, transform: withoutPattern, critical: true},
    {key: 'banners', initial: 'banners', load: fetchBanners},
    {key: 'structureBlocks', initial: 'structureBlocks', load: fetchStructureBlocks},
    {key: 'mainPageProducts', initial: 'mainPageProducts', load: fetchMainPageProducts},
    {key: 'popularProducts', initial: 'popularProducts', load: fetchPopularProducts, awaited: true, warm: (items) => warmImages(items.map(({product}) => product?.image))},
    {key: 'catalogs', initial: 'catalogs', load: fetchCatalogs},
    {key: 'infoBlocks', initial: 'infoBlocks', load: fetchInfoBlocks}
];

const CRITICAL_COUNT = SOURCES.filter((source) => source.critical).length;
const WARM_IMAGE_LIMIT = 12;
const WARM_TIMEOUT_MS = 1500;

function warmImages(urls) {
    const loads = urls.filter(Boolean).slice(0, WARM_IMAGE_LIMIT).map((url) => new Promise((resolve) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = resolve;
        image.src = url;
    }));

    return Promise.race([
        Promise.all(loads),
        new Promise((resolve) => setTimeout(resolve, WARM_TIMEOUT_MS))
    ]);
}

const seedFromInjected = () => {
    const seed = {};

    SOURCES.forEach(({key, initial, transform}) => {
        const injected = INITIAL_DATA[initial];
        seed[key] = hasItems(injected) ? (transform ? transform(injected) : injected) : null;
    });

    return seed;
};

let isFetching = false;

export const useStructureStore = create((set, get) => ({
    ...seedFromInjected(),

    status: 'idle',
    error: null,

    load: async () => {
        if (isFetching) return;
        isFetching = true;

        try {
            await runLoad(set, get);
        } finally {
            isFetching = false;
        }
    }
}));

const missingCriticalKeys = (get) =>
    SOURCES.filter((source) => source.critical && !hasItems(get()[source.key])).map(({key}) => key);

async function runLoad(set, get) {
    const blocking = SOURCES.filter((source) => (source.critical || source.awaited) && !hasItems(get()[source.key]));

    set({status: 'loading', error: null});

    const fetchOne = async ({key, load, transform}) => {
        const result = await load();
        if (hasItems(result)) set({[key]: transform ? transform(result) : result});
    };

    const background = Promise.all(
        SOURCES.filter((source) => !blocking.includes(source)).map(fetchOne)
    );

    await Promise.all(blocking.map(fetchOne));

    await Promise.all(SOURCES
        .filter((source) => source.warm && hasItems(get()[source.key]))
        .map((source) => source.warm(get()[source.key])));

    const missing = missingCriticalKeys(get);
    set({
        status: missing.length === CRITICAL_COUNT ? 'error' : 'ready',
        error: missing.length ? `Не загружено: ${missing.join(', ')}` : null
    });

    await background;
}

export const selectIsStructureReady = (state) => state.status === 'ready' || state.status === 'error';
