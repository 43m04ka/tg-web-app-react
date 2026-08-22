import {create} from 'zustand';
import {request} from '../../../shared/api/client';

// Админка досталась от старого приложения и ждала стор useGlobalData целиком.
// Из него ей нужны ровно четыре вещи, поэтому вместо переноса legacy-стора
// в ветку редизайна здесь лежит совместимая заглушка на новом слое запросов.
//
// Витрины админка читает своим запросом, а не из useStructureStore: тому нужны
// только видимые страницы, а здесь скрытые как раз и правят.

const bySerialNumber = (list) =>
    Array.isArray(list) ? [...list].sort((a, b) => a.serialNumber - b.serialNumber) : null;

const fetchPages = () =>
    request('/api/structure/allPages')
        .then((payload) => bySerialNumber(payload?.result))
        .catch((error) => {
            console.error('[admin] allPages:', error.message);
            return null;
        });

const fetchCatalogs = (options) =>
    request('/api/catalog/allCatalogs', {
        query: options?.includeStatus ? {includeStatus: 'true'} : undefined
    })
        .then((payload) => payload?.result ?? null)
        .catch((error) => {
            console.error('[admin] allCatalogs:', error.message);
            return null;
        });

const visibleOnly = (pages) => pages.filter((page) => page.isHidden !== 1);

const useGlobalData = create((set) => ({
    pageList: null,

    // Совместимо со старой сигнатурой: без аргумента — только видимые витрины,
    // true — все вместе со скрытыми, массив — проставить готовый список.
    updatePageList: async (data) => {
        if (Array.isArray(data)) {
            set({pageList: visibleOnly(data)});
            return;
        }

        const result = await fetchPages();
        if (result) set({pageList: data === true ? result : visibleOnly(result)});
    },

    catalogList: null,

    updateCatalogList: async (data, options) => {
        if (typeof data !== 'undefined') {
            set({catalogList: data});
            return;
        }

        const result = await fetchCatalogs(options);
        if (result) set({catalogList: result});
    }
}));

export default useGlobalData;
