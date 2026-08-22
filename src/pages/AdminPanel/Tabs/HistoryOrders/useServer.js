import {ADMIN_API_URL, adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = ADMIN_API_URL;

export function useServer() {

    // Раньше ни одна из этих функций не проверяла ответ сервера — форма/список одинаково
    // молчали и при успехе, и при отказе (например «нет доступа»).
    const throwIfFailed = async (response, fallback) => {
        if (response.ok) return;

        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || fallback);
    };

    const getHistoryList = async (search) => {
        const response = await fetch(`${URL}/getHistoryList?time=${Date.now()}&search=${encodeURIComponent(search)}`, {
            method: 'GET',
            headers: adminAuthHeadersJson(),
        });

        await throwIfFailed(response, 'Не удалось загрузить список заказов');

        const data = await response.json().catch(() => ({}));
        return data.result || [];
    };

    const getOrderData = async (orderId) => {
        const response = await fetch(`${URL}/getOrderData?time=${Date.now()}&orderId=${orderId}`, {
            method: 'GET',
            headers: adminAuthHeadersJson(),
        });

        await throwIfFailed(response, 'Не удалось загрузить заказ');

        const data = await response.json().catch(() => ({}));
        return {positions: data.result || [], user: data.user || {}, order: data.order || {}};
    };

    const setOrderStatus = async (authenticationData, orderId, status) => {
        const response = await fetch(`${URL}/order/set-status`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, orderId, status})),
        });

        await throwIfFailed(response, 'Не удалось изменить статус заказа');

        const data = await response.json().catch(() => ({}));
        return data;
    };

    const sendMassageUndefinedName = async (orderId) => {
        const response = await fetch(`${URL}/sendMassageUndefinedName?time=${Date.now()}&orderId=${orderId}`, {
            method: 'GET',
            headers: adminAuthHeadersJson(),
        });

        await throwIfFailed(response, 'Не удалось отправить сообщение');
    };

    return {getHistoryList, getOrderData, setOrderStatus, sendMassageUndefinedName};
}
