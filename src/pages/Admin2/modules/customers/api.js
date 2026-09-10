import {httpGet} from '../../platform/http';

export const fetchCustomers = (query) => httpGet('/customers', {query});

export const fetchCustomer = (id) => httpGet(`/customers/${id}`);
