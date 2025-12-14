const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useServer() {

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

    const getCatalogList = async (setResult) => {
        await fetch(`${URL}/getCatalogList?time=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then(async (data) => {
                await setResult(data.result)
            })
        })
    }



    const deleteCard = async (setResult, authenticationData, cardId) => {
        await fetch(`${URL}/deleteCard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, id:cardId})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }



    const updateCardData = async (setResult, authenticationData, cardId, updateData) => {
        await fetch(`${URL}/updateCardData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, cardId:cardId, updateData:updateData})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const updateCatalogData = async (setResult, authenticationData, catalogId, updateData) => {
        await fetch(`${URL}/updateCatalogData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, catalogId:catalogId, updateData:updateData})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }



    const searchForName = async (setResult, searchString) => {
        await fetch(`${URL}/searchForName?searchString=${searchString}&time=${Date.now()}`, {
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



    const updateAssociations = async (authenticationData) => {
        await fetch(URL + '/updateAssociations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData})
        }).then()
    };

    const setExchangeIndiaCatalog = async (authenticationData, catalogId) => {
        await fetch(URL + '/setExchangeIndiaCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, id: catalogId})
        })
    }


    const getAssociationsStatus = async (setResult) => {
        await fetch(URL + '/getAssociationsStatus?time='+Date.now(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.status)
            })
        })
    }

    return {
        getCardList, getCard, getCatalogList,
        updateCatalogData,
        updateCardData, updateAssociations,
        deleteCard,
        searchForName, setExchangeIndiaCatalog,
        getAssociationsStatus}
}