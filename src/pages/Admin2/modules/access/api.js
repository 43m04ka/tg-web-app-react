import {httpGet, httpPost} from '../../platform/http';

export const fetchSessions = () => httpGet('/sessions');

export const revokeSession = (id) => httpPost(`/sessions/${id}/revoke`, {});

export const revokeOtherSessions = () => httpPost('/sessions/revoke-others', {});

export const fetchAllSettings = () => httpGet('/settings/all');

export const updateSetting = ({key, value, type}) => httpPost('/settings/update', {key, value, type});
