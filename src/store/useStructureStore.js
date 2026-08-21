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
    {key: 'pages', initial: 'pages', load: fetchPages, transform: visibleOnly, critical: true},
    {key: 'startPages', initial: 'startPages', load: fetchStartPages, critical: true},
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

        const fetchOne = async ({key, load, transform}) => {
            const result = await load(signal);
            if (signal?.aborted) return;
            if (hasItems(result)) set({[key]: transform ? transform(result) : result});
        };

        const critical = missing.filter((source) => source.critical);
        const background = Promise.all(missing.filter((source) => !source.critical).map(fetchOne));

        await Promise.all(critical.map(fetchOne));
        if (signal?.aborted) return;

        const missingCritical = SOURCES
            .filter((source) => source.critical && !hasItems(get()[source.key]))
            .map(({key}) => key);

        set({
            status: missingCritical.length === SOURCES.filter((s) => s.critical).length ? 'error' : 'ready',
            error: missingCritical.length ? `Не загружено: ${missingCritical.join(', ')}` : null
        });

        await background;
        if (signal?.aborted) return;

        writeCache(CACHE_KEY, SOURCES.reduce((acc, {key}) => ({...acc, [key]: get()[key]}), {}));
    }
}));

export const selectIsStructureReady = (state) => state.status === 'ready' || state.status === 'error';
