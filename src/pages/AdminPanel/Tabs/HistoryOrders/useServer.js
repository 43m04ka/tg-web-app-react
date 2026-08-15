import {ADMIN_API_URL} from '../../adminAuth';

const URL = ADMIN_API_URL

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

    const getOrderData = async (setResult, setUserData, setOrder, orderId) => {
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
                setOrder(data.order || {})
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
