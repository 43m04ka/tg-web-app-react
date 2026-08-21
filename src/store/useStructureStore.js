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
const CACHE_MAX_AGE_MS = 5 * 60 * 1000;

const visibleOnly = (pages) => (Array.isArray(pages) ? pages.filter((page) => page.isHidden !== 1) : null);

const SOURCES = [
    {key: 'pages', initial: 'pages', load: fetchPages, transform: visibleOnly},
    {key: 'startPages', initial: 'startPages', load: fetchStartPages},
    {key: 'structureBlocks', initial: 'structureBlocks', load: fetchStructureBlocks},
    {key: 'mainPageProducts', initial: 'mainPageProducts', load: fetchMainPageProducts},
    {key: 'catalogs', initial: 'catalogs', load: fetchCatalogs}
];

const seedFromKnownSources = () => {
    const cached = readCache(CACHE_KEY, CACHE_MAX_AGE_MS) || {};
    const seed = {};

    SOURCES.forEach(({key, initial, transform}) => {
        const injected = INITIAL_DATA[initial];
        const value = hasItems(injected) ? injected : cached[key];
        seed[key] = hasItems(value) ? (transform ? transform(value) : value) : null;
    });

    return seed;
};

export const useStructureStore = create((set, get) => ({
    ...seedFromKnownSources(),

    status: 'idle',
    error: null,

    load: async (signal) => {
        if (get().status === 'loading') return;
        set({status: 'loading', error: null});

        const missing = SOURCES.filter(({key}) => !hasItems(get()[key]));

        await Promise.all(missing.map(async ({key, load, transform}) => {
            const result = await load(signal);
            if (signal?.aborted) return;
            if (hasItems(result)) set({[key]: transform ? transform(result) : result});
        }));

        if (signal?.aborted) return;

        const state = get();
        const failed = SOURCES.filter(({key}) => !hasItems(state[key])).map(({key}) => key);

        set({
            status: failed.length === SOURCES.length ? 'error' : 'ready',
            error: failed.length ? `Не загружено: ${failed.join(', ')}` : null
        });

        writeCache(CACHE_KEY, SOURCES.reduce((acc, {key}) => ({...acc, [key]: get()[key]}), {}));
    }
}));

export const selectIsStructureReady = (state) => state.status === 'ready' || state.status === 'error';
