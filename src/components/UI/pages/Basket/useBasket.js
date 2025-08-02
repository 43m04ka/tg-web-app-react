const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useBasket() {

    const getPreviewBasketList = async (setResult, userId) => {
        fetch(`${URL}/getPreviewBasketList?time=${Date.now()}&userId=${userId}`, {
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

    const getBasketList = async (setResult, userId) => {
        fetch(`${URL}/getBasketList?time=${Date.now()}&userId=${userId}`, {
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

    const addCardToBasket = async (setResult, userId, cardId) => {
        fetch(`${URL}/addCardToBasket`, {
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
        fetch(`${URL}/deleteCardToBasket`, {
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

    return {getPreviewBasketList, addCardToBasket, deleteCardToBasket, getBasketList}
}
