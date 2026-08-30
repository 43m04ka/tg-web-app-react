import {ADMIN_API_URL, adminAuthHeadersJson, adminBearerHeaders, withJsonAuth} from '../../adminAuth';

const URL = ADMIN_API_URL;

const throwIfFailed = async (response, fallback) => {
    if (response.ok) return;

    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || fallback);
};

const post = async (path, body, fallback) => {
    const response = await fetch(`${URL}${path}`, {
        method: 'POST',
        headers: adminAuthHeadersJson(),
        body: JSON.stringify(withJsonAuth(body)),
    });

    await throwIfFailed(response, fallback);

    return response.json().catch(() => ({}));
};

const get = async (path, fallback) => {
    const response = await fetch(`${URL}${path}`, {headers: adminBearerHeaders()});

    await throwIfFailed(response, fallback);

    return response.json().catch(() => ({}));
};

export function useServer() {
    const getServiceTree = async () => {
        const data = await get('/services/tree', 'Не удалось загрузить витрину «Сервисы»');
        return data.result || [];
    };

    const createBrand = (authenticationData, brandData) =>
        post('/services/brand/create', {authenticationData, brandData}, 'Не удалось создать бренд');

    const updateBrand = (authenticationData, brandId, updateData) =>
        post('/services/brand/update', {authenticationData, brandId, updateData}, 'Не удалось сохранить бренд');

    const deleteBrand = (authenticationData, brandId) =>
        post('/services/brand/delete', {authenticationData, brandId}, 'Не удалось удалить бренд');

    const createOffer = (authenticationData, offerData) =>
        post('/services/offer/create', {authenticationData, offerData}, 'Не удалось создать номинал');

    const updateOffer = (authenticationData, offerId, updateData) =>
        post('/services/offer/update', {authenticationData, offerId, updateData}, 'Не удалось сохранить номинал');

    const deleteOffer = (authenticationData, offerId) =>
        post('/services/offer/delete', {authenticationData, offerId}, 'Не удалось удалить номинал');

    const getCodes = async (offerId, status = 'all') => {
        const data = await get(
            `/services/codes?offerId=${offerId}&status=${status}`,
            'Не удалось загрузить склад кодов'
        );
        return data.result || [];
    };

    const addCodes = (authenticationData, offerId, codes) =>
        post('/services/codes/add', {authenticationData, offerId, codes}, 'Не удалось добавить коды');

    const deleteCode = (authenticationData, codeId) =>
        post('/services/codes/delete', {authenticationData, codeId}, 'Не удалось удалить код');

    return {
        getServiceTree,
        createBrand, updateBrand, deleteBrand,
        createOffer, updateOffer, deleteOffer,
        getCodes, addCodes, deleteCode,
    };
}
