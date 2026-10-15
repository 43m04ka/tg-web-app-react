import {http, httpGet, httpPost} from '../../platform/http';

export const fetchSessions = () => httpGet('/sessions');

export const revokeSession = (id) => httpPost(`/sessions/${id}/revoke`, {});

export const revokeOtherSessions = () => httpPost('/sessions/revoke-others', {});

export const fetchAllSettings = () => httpGet('/settings/all');

export const updateSetting = ({key, value, type}) => httpPost('/settings/update', {key, value, type});

export const fetchAgentToken = () => httpGet('/agent/token');

export const revokeAgentToken = () => httpPost('/agent/token/revoke', {});

export const downloadAgentToken = async () => {
    const {blob} = await http('/agent/token', {method: 'POST', body: {}, as: 'blob'});

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'agent_token.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
};
