import {create} from 'zustand';
import {INITIAL_DATA, hasItems} from '../shared/lib/initialData';
import {
    fetchCatalogs,
    fetchMainPageProducts,
    fetchPages,
    fetchStartPages,
    fetchStructureBlocks
} from '../shared/api/structure';

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

async function runLoad(set, get) {
    const blocking = SOURCES.filter((source) => source.critical && !hasItems(get()[source.key]));

    set({status: blocking.length ? 'loading' : 'ready', error: null});

    const fetchOne = async ({key, load, transform}) => {
        const result = await load();
        if (hasItems(result)) set({[key]: transform ? transform(result) : result});
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
}

export const selectIsStructureReady = (state) => state.status === 'ready' || state.status === 'error';
