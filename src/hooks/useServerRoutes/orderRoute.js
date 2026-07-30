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

    return {createOrder, getHistoryList, checkPaymentStatus}
}
