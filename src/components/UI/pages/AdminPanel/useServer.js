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

    const createCatalog = async (setResult, authenticationData, path, pageId) => {
        await fetch(`${URL}/createCatalog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, path:path, structurePageId:pageId})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const createStructureCatalog = async (authenticationData, catalogData) => {
        await fetch(URL + '/createStructureCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, catalogData:catalogData})
        })
    };

    const deleteCatalog = async (setResult, authenticationData, catalogId) => {
        await fetch(`${URL}/deleteCatalog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, id:catalogId})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
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

    const changeSaleStatusCatalog = async (setResult, authenticationData, catalogId, changeTo) => {
        await fetch(`${URL}/changeSaleStatusCatalog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, catalogId:catalogId, changeTo:changeTo})
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

    const updatePageData = async (setResult, authenticationData, pageId, updateData) => {
        await fetch(`${URL}/updatePageData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, pageId:pageId, updateData:updateData})
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

    const createPage = async (setResult, authenticationData, pageData) => {
        await fetch(URL + '/createPage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, pageData:pageData})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    };

    const updateAssociations = async (authenticationData) => {
        await fetch(URL + '/updateAssociations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData})
        }).then()
    };

    const getStructureCatalogList = async (pageId, group, setResult) => {
        await fetch(URL + '/getStructureCatalogList', {
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

    const deleteStructureCatalog = async (authenticationData, catalogId) => {
        await fetch(URL + '/deleteStructureCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, id: catalogId})
        })
    }

    return {
        getCardList, getCard, getCatalogList, getStructureCatalogList,
        createCatalog, createPage, createStructureCatalog,
        changeSaleStatusCatalog, updateCardData, updatePageData, updateAssociations,
        deleteStructureCatalog, deleteCatalog, deleteCard,
        searchForName}
}