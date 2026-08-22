import {API_BASE_URL, ADMIN_API_URL, adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = ADMIN_API_URL;
const URL_STRUCTURE = `${API_BASE_URL}/api/structure`;

export function useServer() {

    // Раньше ни одна из этих функций не проверяла ответ сервера: и создание, и удаление
    // одинаково молчали при отказе («нет доступа», ошибка базы), а список просто не менялся.
    const throwIfFailed = async (response, fallback) => {
        if (response.ok) return;

        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || fallback);
    };

    // Список блоков отдаёт публичная ручка витрины — отдельной админской для них нет
    const getInfoBlockList = async () => {
        const response = await fetch(`${URL_STRUCTURE}/infoBlocks?time=${Date.now()}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        await throwIfFailed(response, 'Не удалось загрузить список блоков');

        const data = await response.json().catch(() => ({}));
        return data.result || [];
    };

    const createInfoBlock = async (authenticationData, infoBlockData) => {
        const response = await fetch(`${URL}/createInfoBlock`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, infoBlockData})),
        });

        await throwIfFailed(response, 'Не удалось создать блок');
    };

    const updateInfoBlock = async (authenticationData, infoBlockId, updateData) => {
        const response = await fetch(`${URL}/updateInfoBlock`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, id: infoBlockId, updateData})),
        });

        await throwIfFailed(response, 'Не удалось сохранить блок');
    };

    const deleteInfoBlock = async (authenticationData, infoBlockId) => {
        const response = await fetch(`${URL}/deleteInfoBlock`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, id: infoBlockId})),
        });

        await throwIfFailed(response, 'Не удалось удалить блок');
    };

    return {getInfoBlockList, createInfoBlock, updateInfoBlock, deleteInfoBlock};
}
