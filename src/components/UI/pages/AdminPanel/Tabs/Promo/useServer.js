const URL = '/api/admin'

export function useServer() {

    const getPromoList = async (authenticationData, setResult) => {
        fetch(`${URL}/getPromoList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                authenticationData: authenticationData
            })
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const createPromo = async (authenticationData, promoData) => {
        fetch(`${URL}/createPromo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                authenticationData: authenticationData,
                promoData: promoData
            })
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    const deletePromo = async (authenticationData, promoId) => {
        fetch(`${URL}/deletePromo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                authenticationData: authenticationData,
                promoId: promoId
            })
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    return {getPromoList, createPromo, deletePromo}

}