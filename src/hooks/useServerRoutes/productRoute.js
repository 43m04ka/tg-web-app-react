import {API_BASE_URL} from "./baseUrl";

export function productRoute(){

    const getCard = async (setResult, productId) => {
        fetch(`${API_BASE_URL}/api/product/${productId}?time=${Date.now()}`, {
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
        fetch(`${API_BASE_URL}/api/product/recommendations?pageId=${pageId}`, {
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
        fetch(`${API_BASE_URL}/api/product/prepareShareMessage?time=${Date.now()}&id=${id}&userId=${userId}`, {
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
