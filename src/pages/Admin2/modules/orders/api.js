import {httpGet, httpPost} from '../../platform/http';

export const fetchOrders = (query) => httpGet('/orders', {query});

export const fetchOrder = (orderId) => httpGet('/getOrderData', {query: {orderId}});

export const setOrderStatus = ({orderId, status}) => httpPost('/order/set-status', {orderId, status});

export const markPayoutManual = (orderId) => httpPost('/order/payout-manual', {orderId});

export const notifyClosedProfile = (orderId) => httpGet('/sendMassageUndefinedName', {query: {orderId}});
