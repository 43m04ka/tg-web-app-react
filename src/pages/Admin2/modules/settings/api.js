import {httpGet, httpPost} from '../../platform/http';

export const fetchSettings = () => httpGet('/settings/public');

export const updateSetting = ({key, value, type}) => httpPost('/settings/update', {key, value, type});

export const refreshStructure = () => httpPost('/refresh-structure-data', {});
