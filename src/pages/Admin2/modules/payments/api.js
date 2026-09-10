import {httpGet, httpPost} from '../../platform/http';

export const fetchRegistry = () => httpGet('/payment-methods');

export const saveMethod = (method) => httpPost('/payment-methods', method);

export const deleteMethod = (code) => httpPost('/payment-methods/delete', {code});

export const saveRules = (rules) => httpPost('/payment-methods/rules', {rules});

export const previewResolve = ({platform, scenario, pageType}) =>
    httpGet('/payment-methods/preview', {query: {platform, scenario, pageType}});

export const updateSetting = ({key, value, type}) => httpPost('/settings/update', {key, value, type});
