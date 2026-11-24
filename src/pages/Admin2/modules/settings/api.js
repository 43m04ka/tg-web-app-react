import {httpGet, httpPost} from '../../platform/http';

export const fetchSettings = () => httpGet('/settings/all');

export const updateSetting = ({key, value, type}) => httpPost('/settings/update', {key, value, type});

export const refreshStructure = () => httpPost('/refresh-structure-data', {});

export const fetchTurkeyCodesStock = () => httpGet('/services/supplier/turkey-codes');
