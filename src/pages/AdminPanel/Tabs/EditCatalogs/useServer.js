import {ADMIN_API_URL, adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = ADMIN_API_URL;

export function useServer() {

    const createCatalog = async (setResult, authenticationData, newCatalogData) => {
        const body = withJsonAuth({...newCatalogData, authenticationData});

        await fetch(`${URL}/createCatalog`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(body),
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
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, id: catalogId})),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const changeSaleStatusCatalog = async (setResult, authenticationData, catalogId, changeTo) => {
        await fetch('https://gwstorebot.ru/api/catalog/changeSaleStatusCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData: authenticationData, catalogId: catalogId, changeTo: changeTo}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    return {changeSaleStatusCatalog, deleteCatalog, createCatalog}

}
