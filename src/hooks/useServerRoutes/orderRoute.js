import {API_BASE_URL} from "./baseUrl";
import useGlobalData from "../useGlobalData";

export function orderRoute(){

    const createOrder = async (orderInput, setResult) => {
        const actualUserId = useGlobalData.getState().internalUserId;

        const bodyData = {
            userId: actualUserId,
            platform: orderInput.platform,
            pageId: orderInput.pageId,
            contact: orderInput.contact,
            username: orderInput.username,
            accountData: orderInput.accountData,
            email: orderInput.email,
            paymentMethod: orderInput.paymentMethod,
            promoCode: orderInput.promoCode,
        };

        if (orderInput.vkGroupId) {
            bodyData.vkGroupId = orderInput.vkGroupId;
        }

        fetch(`${API_BASE_URL}/api/order/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(bodyData),
        }).then(async response => {
            const data = await response.json();
            setResult({...data, ok: response.ok});
        })
    }


    const getHistoryList = async (setResult, chatId) => {
        const actualUserId = useGlobalData.getState().internalUserId || chatId;
        fetch(`${API_BASE_URL}/api/order/history?time=${Date.now()}&userId=${actualUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const checkPaymentStatus = async (orderId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/payment/status?id=${orderId}&time=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking payment status:', error);
            return { error: error.message };
        }
    }

    // POST /api/payment/cancel — пользователь передумал платить.
    // 409 не ошибка интеграции, а гонка с подтверждением кассы: в ответе приходит
    // фактический статус заказа, его и показываем.
    const cancelPayment = async (orderId) => {
        const actualUserId = useGlobalData.getState().internalUserId;
        try {
            const response = await fetch(`${API_BASE_URL}/api/payment/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({orderId, userId: actualUserId}),
            });
            const data = await response.json();
            return {...data, ok: response.ok, httpStatus: response.status};
        } catch (error) {
            console.error('Error canceling payment:', error);
            return {ok: false, error: error.message};
        }
    }

    return {createOrder, getHistoryList, checkPaymentStatus, cancelPayment}
}
