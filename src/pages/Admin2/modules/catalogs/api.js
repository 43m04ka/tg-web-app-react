import {http, httpDownload, httpGet, httpPost} from '../../platform/http';

export const fetchCatalogs = () => httpGet('/allCatalogs', {area: 'catalog', query: {includeStatus: 'true'}});

export const fetchPages = () => httpPost('/getPages', {});

export const createCatalog = (payload) => httpPost('/createCatalog', payload);

export const deleteCatalog = (id) => httpPost('/deleteCatalog', {id});

export const setIndiaExchange = (id) => httpPost('/setExchangeIndiaCatalog', {id});

export const changeSaleStatus = (catalogId, changeTo) =>
    httpPost('/changeSaleStatusCatalog', {catalogId, changeTo}, {area: 'catalog'});

export const clearCatalog = (catalogId) =>
    httpPost('/deleteCatalogProducts', {catalogId}, {area: 'catalog'});

export const fetchQueue = () => httpGet('/parse-queue', {area: 'parsing'});

export const cancelQueued = (id) => httpPost(`/parse-queue/${id}/cancel`, {}, {area: 'parsing'});

export const startParse = (source, payload) => httpPost(
    source === 'xbox' ? '/start-parse-xbox' : '/start-parse-ps',
    payload,
    {area: 'parsing', timeoutMs: 60000}
);

export const parseLinks = (source, payload) => httpPost(
    source === 'xbox' ? '/parse-links-xbox' : '/parse-links-ps',
    payload,
    {area: 'parsing', timeoutMs: 60000}
);

export const startRecheck = (payload) => httpPost('/recheck', payload, {area: 'parsing'});

export const fetchRecheckReports = () => httpGet('/recheck', {area: 'parsing'});

export const fetchRecheckReport = (id) => httpGet(`/recheck/${id}`, {area: 'parsing'});

export const expirePromotions = (dryRun) => httpPost('/expire-promotions', {dryRun}, {area: 'parsing'});

export const fetchAssociationsSchedule = () => httpGet('/associations/schedule');

export const runAssociations = (catalogId) =>
    httpPost('/updateAssociations', catalogId ? {catalogId} : {}, {timeoutMs: 120000});

export const scheduleAssociations = (runAt) => httpPost('/associations/schedule', {runAt});

export const cancelAssociationsSchedule = () => httpPost('/associations/schedule/cancel', {});

export const exportCatalog = (catalogId, path) =>
    httpDownload(`/export/${catalogId}`, {area: 'catalog', filename: `${path || catalogId}.xlsx`});

export const importCatalog = (catalogId, file) => {
    const form = new FormData();
    form.append('file', file);

    return http('/import', {
        method: 'POST',
        area: 'product',
        query: {catalogId},
        form,
        timeoutMs: 300000
    });
};
