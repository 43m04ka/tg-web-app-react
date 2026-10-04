import {httpGet, httpPost} from '../../platform/http';

export const fetchSubscriptionInfo = () => httpGet('/subscription-info');

export const refreshSubscriptionInfo = () => httpPost('/subscription-info/refresh', {}, {timeoutMs: 180000});

export const saveSubscriptionEdits = ({region, service, edits}) =>
    httpPost('/subscription-info/edits', {region, service, edits});
