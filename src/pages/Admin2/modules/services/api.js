import {httpGet, httpPost} from '../../platform/http';

export const fetchTree = () => httpGet('/services/tree');

export const fetchLinkableCatalogs = () => httpGet('/services/catalogs');

export const createBrand = (brandData) => httpPost('/services/brand/create', {brandData});

export const updateBrand = ({brandId, updateData}) => httpPost('/services/brand/update', {brandId, updateData});

export const deleteBrand = (brandId) => httpPost('/services/brand/delete', {brandId});

export const saveOffers = ({brandId, offers, deleteIds}) => httpPost('/services/offer/bulk', {brandId, offers, deleteIds});

export const fetchCodes = ({offerId, status}) => httpGet('/services/codes', {query: {offerId, status}});

export const addCodes = ({offerId, codes}) => httpPost('/services/codes/add', {offerId, codes});

export const deleteCode = (codeId) => httpPost('/services/codes/delete', {codeId});
