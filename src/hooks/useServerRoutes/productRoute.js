export function productRoute(){

    const getCard = async (setResult, productId) => {
        fetch(`/api/product/${productId}?time=${Date.now()}`, {
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


    const getRecommendationsGames = async (setResult, pageId) => {
        fetch(`/api/product/recommendations?pageId=${pageId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result || null)
            })
        })
    }

    const prepareShareMessage = async (setResult, id, userId) => {
        fetch(`/api/product/prepareShareMessage?time=${Date.now()}&id=${id}&userId=${userId}`, {
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

    return {getCard, getRecommendationsGames, prepareShareMessage}
}