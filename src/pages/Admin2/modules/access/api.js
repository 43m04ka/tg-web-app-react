import {httpGet, httpPost} from '../../platform/http';

export const fetchSessions = () => httpGet('/sessions');

export const revokeSession = (id) => httpPost(`/sessions/${id}/revoke`, {});

export const revokeOtherSessions = () => httpPost('/sessions/revoke-others', {});
