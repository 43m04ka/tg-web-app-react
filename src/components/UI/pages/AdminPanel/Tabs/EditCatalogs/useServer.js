const URL = '/api/admin'

export function useServer() {

    const createCatalog = async (setResult, authenticationData, newCatalogData) => {
        let body  = newCatalogData
        body.authenticationData = authenticationData

        await fetch(`${URL}/createCatalog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

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

    return {changeSaleStatusCatalog, deleteCatalog, createCatalog}

}