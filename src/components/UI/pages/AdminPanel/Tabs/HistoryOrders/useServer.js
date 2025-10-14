const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useServer() {

    const getHistoryList = async (setResult, search) => {
        fetch(`${URL}/getHistoryList?time=${Date.now()}&search=${search}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result || [])
            })
        })
    }

    const getOrderData = async (setResult, orderId) => {
        fetch(`${URL}/getOrderData?time=${Date.now()}&orderId=${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result || [])
            })
        })
    }

    const sendMassageUndefinedName = async (orderId) => {
        fetch(`${URL}/sendMassageUndefinedName?time=${Date.now()}&orderId=${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    return {getHistoryList, getOrderData, sendMassageUndefinedName}

}