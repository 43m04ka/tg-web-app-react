import {API_BASE_URL} from "./baseUrl";

export function orderRoute(){

    const createOrder = async (paymentData, accData, user, page, promo, setResult) => {
        fetch(`${API_BASE_URL}/api/order/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({paymentData: paymentData, accData: accData, user: user, page: page, promo: promo}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data)
            })
        })
    }


    const getHistoryList = async (setResult, chatId) => {
        fetch(`${API_BASE_URL}/api/order/history?time=${Date.now()}&chatId=${chatId}`, {
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

    return {createOrder, getHistoryList}
}
