import {httpGet, httpPost} from '../../platform/http';

export const fetchActivePlan = () => httpGet('/agent/plans/active');

export const fetchPlans = () => httpGet('/agent/plans', {query: {limit: 20}});

export const fetchPlan = (id) => httpGet(`/agent/plans/${id}`);

export const pausePlan = (id) => httpPost(`/agent/plans/${id}/pause`, {reason: 'Пауза из админки'});

export const cancelPlan = (id) => httpPost(`/agent/plans/${id}/cancel`, {});
