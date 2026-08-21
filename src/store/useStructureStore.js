import {create} from 'zustand';
import {INITIAL_DATA, hasItems} from '../shared/lib/initialData';
import {readCache, writeCache} from '../shared/lib/persist';
import {
    fetchCatalogs,
    fetchMainPageProducts,
    fetchPages,
    fetchStartPages,
    fetchStructureBlocks
} from '../shared/api/structure';

const CACHE_KEY = 'structure';
const CACHE_KIND = 'local';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const visibleOnly = (pages) => (Array.isArray(pages) ? pages.filter((page) => page.isHidden !== 1) : null);

const SOURCES = [
    {key: 'pages', initial: 'pages', load: fetchPages, transform: visibleOnly, critical: true},
    {key: 'startPages', initial: 'startPages', load: fetchStartPages, critical: true},
    {key: 'structureBlocks', initial: 'structureBlocks', load: fetchStructureBlocks},
    {key: 'mainPageProducts', initial: 'mainPageProducts', load: fetchMainPageProducts},
    {key: 'catalogs', initial: 'catalogs', load: fetchCatalogs}
];

const seedFromKnownSources = () => {
    const cached = readCache(CACHE_KEY, CACHE_MAX_AGE_MS, CACHE_KIND) || {};
    const seed = {};

    SOURCES.forEach(({key, initial, transform}) => {
        const injected = INITIAL_DATA[initial];
        const value = hasItems(injected) ? injected : cached[key];
        seed[key] = hasItems(value) ? (transform ? transform(value) : value) : null;
    });

    return seed;
};

let isFetching = false;

export const useStructureStore = create((set, get) => ({
    ...seedFromKnownSources(),

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

async function runLoad(set, get) {
    const isSeeded = (source) => hasItems(get()[source.key]);
    const blocking = SOURCES.filter((source) => source.critical && !isSeeded(source));

    set({status: blocking.length ? 'loading' : 'ready', error: null});

    const fetchOne = async ({key, load, transform}) => {
        const result = await load();
        if (hasItems(result)) set({[key]: transform ? transform(result) : result});
    };

    const background = Promise.all(
        SOURCES.filter((source) => !blocking.includes(source)).map(fetchOne)
    );

    await Promise.all(blocking.map(fetchOne));

    const missingCritical = SOURCES
        .filter((source) => source.critical && !hasItems(get()[source.key]))
        .map(({key}) => key);

    if (blocking.length) {
        set({
            status: missingCritical.length === SOURCES.filter((s) => s.critical).length ? 'error' : 'ready',
            error: missingCritical.length ? `Не загружено: ${missingCritical.join(', ')}` : null
        });
    }

    await background;

    if (missingCritical.length) return;

    writeCache(
        CACHE_KEY,
        SOURCES.reduce((acc, {key}) => ({...acc, [key]: get()[key]}), {}),
        CACHE_KIND
    );
}

export const selectIsStructureReady = (state) => state.status === 'ready' || state.status === 'error';
