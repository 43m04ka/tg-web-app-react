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

    const prepareShareMessage = async (setResult, id, userId) => {
        fetch(`${URL}/prepareShareMessage?time=${Date.now()}&id=${id}&userId=${userId}`, {
            method: 'GET', headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.id)
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

    const getSearch = async (setResult, name, pageId) => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/getSearch', {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({
                str: name, pageId: pageId, json: {platform: [], language: [], numberPlayers: []}
            })
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                let resultList = []
                prom.cards.map(card => {
                    let flag = true
                    resultList.map(resCard => {
                        if (card.name === resCard.name && card.similarCard?.price === resCard.similarCard?.price && card.regionActivate === resCard.regionActivate && card.choiceRow === resCard.choiceRow && card.choiceColumn === resCard.choiceColumn) {
                            flag = false
                        }
                    })
                    if (flag) {
                        resultList.push(card)
                    }
                }).filter(el => el !== null)
                if (name === '') {
                    setResult(null)
                } else {
                    setResult(resultList.splice(0, 20))
                }
            })
        })
    }



    return {
        getCard, addCardToFavorite, deleteCardToFavorite, addCardToBasket, findCardsByCatalog, prepareShareMessage, getSearch
    }
}
