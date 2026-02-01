export function catalogRoute(){

    const getCatalogList = async (setResult) => {
        await fetch(`/api/catalog/allCatalogs?time=${Date.now()}`, {
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

    const getCardList = async (setResult, catalogId, listNumber, json) => {
        fetch(`/api/catalog/productList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },body: JSON.stringify({catalogId: catalogId, listNumber: listNumber, json:json}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data, listNumber)
            })
        })
    }

    return {getCatalogList, getCardList}
}