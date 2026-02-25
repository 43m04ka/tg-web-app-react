import {API_BASE_URL} from "./baseUrl";

export function basketRoute(){

    const getBasketList = async (setResult, userId) => {
        fetch(`${API_BASE_URL}/api/basket/${userId}?time=${Date.now()}`, {
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


    const setBasketPositionCount = async (setResult, userId, cardId, count) => {
        fetch(`${API_BASE_URL}/api/basket/updateCountProduct`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({cardId: cardId, userId: userId, count: count}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const addCardToBasket = async (setResult, userId, cardId) => {
        fetch(`${API_BASE_URL}/api/basket/addProduct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({cardId: cardId, userId: userId}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const deleteCardToBasket = async (setResult, userId, cardId) => {
        fetch(`${API_BASE_URL}/api/basket/deleteProduct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({cardId: cardId, userId: userId}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const usePromo = async (name, setResult) => {
        await fetch(`${API_BASE_URL}/api/basket/usePromo?time=${Date.now()}&name=${name}`, {
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
    
    return {getBasketList, deleteCardToBasket, addCardToBasket, setBasketPositionCount, usePromo}
}
