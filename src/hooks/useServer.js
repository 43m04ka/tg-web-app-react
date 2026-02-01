const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useServer() {


    const authentication = async (data, setResult) => {
        await fetch(URL + '/authentication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(async response => {
            setResult(response.status === 200);
        })
    }

    const getCategories = async (setResult) => {
        await fetch(URL + '/getCategories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const getSearch = async (searchString, tabId, setResult) => {
        await fetch(URL + '/getSearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({search: searchString, tabId: tabId})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const deleteCards = async (path, idList) => {
        await fetch(URL + '/deleteCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({path: path, idList: idList})
        })
    }

    const changeStatusCards = async (path, idList) => {
        await fetch(URL + '/changeStatusCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({path: path, idList: idList})
        })
    }

    const editCardPrice = async (cardId, newPriceList, oldPrice) => {
        await fetch(URL + '/editCardPrice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardId: cardId,
                newPriceList: newPriceList,
                oldPrice: oldPrice
            }),

        });
    };

    const getPreviewCards = async (setResult) => {
        await fetch(URL + '/getPreviewCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const getCatalogs = async (pageId, group, setResult) => {
        await fetch(URL + '/getCatalogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({pageId:pageId, group:group})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
            })
        })
    }


    const deletePage = async (id) => {
        await fetch(URL + '/deletePage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id})
        })
    }


    return {
        authentication,
        deleteCards,
        changeStatusCards,
        getCategories,
        getSearch,
        editCardPrice,
        deletePage,
        getPreviewCards,
    }
}