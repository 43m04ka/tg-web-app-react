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

    return {getCard, getRecommendationsGames}
}