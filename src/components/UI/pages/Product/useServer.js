const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useServer() {

    const getCard = async (setResult, id) => {
        fetch(`${URL}/getCard?time=${Date.now()}&id=${id}`, {
            method: 'GET', headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const addCardToFavorite = async (setResult, userId, cardId) => {
        fetch(`${URL}/addCardToFavorite`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({cardId: cardId, userId: userId}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const deleteCardToFavorite = async (setResult, userId, cardId) => {
        fetch(`${URL}/deleteCardToFavorite`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({cardId: cardId, userId: userId}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }


    const addCardToBasket = async (setResult, userId, cardId) => {
        fetch(`${URL}/addCardToBasket`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({cardId: cardId, userId: userId}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }



    const findCardsByCatalog = async (catalogId, setResult) => {
        await fetch(URL + '/findCardsByCatalog?catalogId='+catalogId+'&time='+Date.now(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    };



    return {
        getCard, addCardToFavorite, deleteCardToFavorite, addCardToBasket, findCardsByCatalog
    }
}
