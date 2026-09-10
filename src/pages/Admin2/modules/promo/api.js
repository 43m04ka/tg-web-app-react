import {httpGet, httpPost} from '../../platform/http';

export const fetchPromoList = () => httpPost('/getPromoList', {});

export const createPromo = (promoData) => httpPost('/createPromo', {promoData});

export const updatePromo = (promoId, updateData) => httpPost('/updatePromo', {promoId, updateData});

export const deletePromo = (promoId) => httpPost('/deletePromo', {promoId});

export const fetchPromoUsage = (id) => httpGet(`/promo/${id}/usage`);
