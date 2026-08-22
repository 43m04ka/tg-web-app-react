import {API_BASE_URL, ADMIN_API_URL, adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = ADMIN_API_URL;
const URL_SEARCH = `${API_BASE_URL}/api/search`;

export function useServer() {

    // Раньше ни одна из этих функций не проверяла ответ сервера: экран одинаково молчал
    // и при успехе, и при отказе («нет доступа»), а список перезагружался по таймеру.
    const throwIfFailed = async (response, fallback) => {
        if (response.ok) return;

        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || fallback);
    };

    // Отдельного админского эндпоинта на чтение подсказок нет — список маленький
    // и одинаковый для витрины и админки, поэтому берём публичный, но с проверкой ответа
    const getClueList = async () => {
        const response = await fetch(`${URL_SEARCH}/allClue?time=${Date.now()}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        await throwIfFailed(response, 'Не удалось загрузить подсказки');

        const data = await response.json().catch(() => ({}));
        return data.result || [];
    };

    const createClue = async (authenticationData, clueData) => {
        const response = await fetch(`${URL}/createSearchClue`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, clueData})),
        });

        await throwIfFailed(response, 'Не удалось создать подсказку');
    };

    const updateClue = async (authenticationData, id, updateData) => {
        const response = await fetch(`${URL}/updateSearchClue`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, id, updateData})),
        });

        await throwIfFailed(response, 'Не удалось сохранить подсказку');
    };

    const deleteClue = async (authenticationData, id) => {
        const response = await fetch(`${URL}/deleteSearchClue?time=${Date.now()}`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, id})),
        });

        await throwIfFailed(response, 'Не удалось удалить подсказку');
    };

    return {getClueList, createClue, updateClue, deleteClue};
}
