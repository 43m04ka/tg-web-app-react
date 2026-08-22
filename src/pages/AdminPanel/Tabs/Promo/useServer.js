import {ADMIN_API_URL, adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = ADMIN_API_URL;

export function useServer() {

    // Раньше ни одна из этих функций не проверяла ответ сервера: промокод молча «создавался»
    // даже при отказе доступа, а список просто оставался пустым.
    const throwIfFailed = async (response, fallback) => {
        if (response.ok) return;

        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || fallback);
    };

    const getPromoList = async (authenticationData) => {
        const response = await fetch(`${URL}/getPromoList`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData})),
        });

        await throwIfFailed(response, 'Не удалось загрузить список промокодов');

        const data = await response.json().catch(() => ({}));
        return data.result || [];
    };

    const createPromo = async (authenticationData, promoData) => {
        const response = await fetch(`${URL}/createPromo`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, promoData})),
        });

        await throwIfFailed(response, 'Не удалось создать промокод');
    };

    const updatePromo = async (authenticationData, promoId, updateData) => {
        const response = await fetch(`${URL}/updatePromo`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, promoId, updateData})),
        });

        await throwIfFailed(response, 'Не удалось сохранить промокод');
    };

    const deletePromo = async (authenticationData, promoId) => {
        const response = await fetch(`${URL}/deletePromo`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, promoId})),
        });

        await throwIfFailed(response, 'Не удалось удалить промокод');
    };

    return {getPromoList, createPromo, updatePromo, deletePromo};
}
