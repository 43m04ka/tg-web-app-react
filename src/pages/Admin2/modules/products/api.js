import {httpGet, httpPost} from '../../platform/http';

export const fetchProducts = (query) => httpGet('/products', {query});

export const fetchFacets = () => httpGet('/products/facets');

export const fetchCatalogs = () => httpGet('/allCatalogs', {area: 'catalog'});

export const fetchProduct = (id) => httpGet(`/${id}`, {area: 'product'});

export const updateCard = ({cardId, updateData}) => httpPost('/updateCardData', {cardId, updateData});

export const deleteCard = (id) => httpPost('/deleteCard', {id});

export const bulkUpdate = ({ids, updateData}) => httpPost('/products/bulk-update', {ids, updateData});

export const bulkDelete = (ids) => httpPost('/products/bulk-delete', {ids});
