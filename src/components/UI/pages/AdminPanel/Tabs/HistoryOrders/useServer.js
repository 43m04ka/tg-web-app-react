const URL = '/api/admin'

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

    const getOrderData = async (setResult, setUserData, orderId) => {
        fetch(`${URL}/getOrderData?time=${Date.now()}&orderId=${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result || [])
                setUserData(data.user || {})
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