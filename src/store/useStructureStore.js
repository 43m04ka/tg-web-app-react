import {create} from 'zustand';
import {INITIAL_DATA, hasItems} from '../shared/lib/initialData';
import {readBigCache, writeBigCache} from '../shared/lib/bigCache';
import {
    fetchCatalogs,
    fetchMainPageProducts,
    fetchPages,
    fetchStartPages,
    fetchStructureBlocks
} from '../shared/api/structure';

const ICONS_CACHE_KEY = 'startPageIcons';
const ICONS_MAX_AGE_MS = 60 * 60 * 1000;

const visibleOnly = (pages) => (Array.isArray(pages) ? pages.filter((page) => page.isHidden !== 1) : null);

const withoutPattern = (items) =>
    Array.isArray(items) ? items.map(({pattern, ...rest}) => rest) : null;

const SOURCES = [
    {key: 'pages', initial: 'pages', load: fetchPages, transform: visibleOnly, critical: true},
    {key: 'startPages', initial: 'startPages', load: fetchStartPages, transform: withoutPattern, critical: true},
    {key: 'structureBlocks', initial: 'structureBlocks', load: fetchStructureBlocks},
    {key: 'mainPageProducts', initial: 'mainPageProducts', load: fetchMainPageProducts},
    {key: 'catalogs', initial: 'catalogs', load: fetchCatalogs}
];

const CRITICAL_COUNT = SOURCES.filter((source) => source.critical).length;

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

const withCachedIcons = (items, icons) =>
    items.map((item) => (item.icon || !icons[item.id] ? item : {...item, icon: icons[item.id]}));

const collectIcons = (items) =>
    items.reduce((acc, item) => (item.icon ? {...acc, [item.id]: item.icon} : acc), {});

async function runLoad(set, get) {
    const iconsPromise = readBigCache(ICONS_CACHE_KEY, ICONS_MAX_AGE_MS);

    const blocking = SOURCES.filter((source) => source.critical && !hasItems(get()[source.key]));

    set({status: blocking.length ? 'loading' : 'ready', error: null});

    const fetchOne = async ({key, load, transform}) => {
        const result = await load();
        if (!hasItems(result)) return;

        let value = transform ? transform(result) : result;
        if (key === 'startPages') value = withCachedIcons(value, (await iconsPromise) || {});

        set({[key]: value});
    };

    const background = Promise.all(
        SOURCES.filter((source) => !blocking.includes(source)).map(fetchOne)
    );

    await Promise.all(blocking.map(fetchOne));

    if (blocking.length) {
        const missing = missingCriticalKeys(get);
        set({
            status: missing.length === CRITICAL_COUNT ? 'error' : 'ready',
            error: missing.length ? `Не загружено: ${missing.join(', ')}` : null
        });
    }

    await background;

    const startPages = get().startPages;
    if (!hasItems(startPages)) return;

    const icons = collectIcons(startPages);
    if (Object.keys(icons).length) writeBigCache(ICONS_CACHE_KEY, icons);
}

export const selectIsStructureReady = (state) => state.status === 'ready' || state.status === 'error';
