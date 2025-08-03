const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useServerUser() {

    const getPageList = async (setResult) => {
        await fetch(URL + '/getPageList?time=' + Date.now(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            console.log(response)
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
            })
        })
    }

    const getStructureCatalogList = async (setResult) => {
        await fetch(URL + '/getStructureCatalogList?time=' + Date.now(), {
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
    }

    const getPreviewCardList = async (setResult) => {
        await fetch(URL + '/getPreviewCardList?time=' + Date.now(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
            })
        })
    }

    const getCatalogList = async (setResult) => {
        await fetch(`${URL}/getCatalogList?time=${Date.now()}`, {
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
    }

    const getCard = async (setResult, id) => {
        fetch(`${URL}/getCard?time=${Date.now()}&id=${id}`, {
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

    const getCardList = async (setResult, catalogId, listNumber) => {
        fetch(`${URL}/getCardList?time=${Date.now()}&catalogId=${catalogId}&listNumber=${listNumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data)
            })
        })
    }


    const getPreviewFavoriteList = async (setResult, userId) => {
        fetch(`${URL}/getPreviewFavoriteList?time=${Date.now()}&userId=${userId}`, {
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

    const getFavoriteList = async (setResult, userId) => {
        fetch(`${URL}/getFavoriteList?time=${Date.now()}&userId=${userId}`, {
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

    const addCardToFavorite = async (setResult, userId, cardId) => {
        fetch(`${URL}/addCardToFavorite`, {
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

    const deleteCardToFavorite = async (setResult, userId, cardId) => {
        fetch(`${URL}/deleteCardToFavorite`, {
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

    const getHistoryList = async (setResult, chatId) => {
        fetch(`${URL}/history?time=${Date.now()}&chatId=${chatId}`, {
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

    return {
        getPageList, getStructureCatalogList, getPreviewCardList, getCatalogList, getCardList, getCard,
        getPreviewFavoriteList, addCardToFavorite, deleteCardToFavorite, getFavoriteList,
        getPreviewBasketList, addCardToBasket, deleteCardToBasket, getBasketList,
        getHistoryList
    }
}
