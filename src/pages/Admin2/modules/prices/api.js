import {httpGet, httpPost} from '../../platform/http';

export const fetchRules = (platform) => httpGet(`/price-rules/${platform}`);

export const saveRules = ({platform, rules}) => httpPost(`/price-rules/${platform}`, {rules});

export const fetchCatalogs = () => httpGet('/allCatalogs', {area: 'catalog'});

export const recalculate = ({catalogId, rules}) => httpPost('/recalculate', {catalogId, rules}, {area: 'catalog', timeoutMs: 120000});
