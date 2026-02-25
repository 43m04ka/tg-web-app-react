import {API_BASE_URL} from "./baseUrl";

export function favoriteRoute(){


    const getPreviewFavoriteList = async (setResult, userId) => {
        fetch(`${API_BASE_URL}/api/favorite/previewFavoriteProducts/${userId}?time=${Date.now()}`, {
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

    const deleteCardToFavorite = async (setResult, userId, cardId) => {
        fetch(`${API_BASE_URL}/api/favorite/deleteProduct`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({cardId: cardId, userId: userId}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }


    const addCardToFavorite = async (setResult, userId, cardId) => {
        fetch(`${API_BASE_URL}/api/favorite/addProduct`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({cardId: cardId, userId: userId}),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const getFavoriteList = async (setResult, userId) => {
        fetch(`${API_BASE_URL}/api/favorite/allFavoriteProducts/${userId}?time=${Date.now()}`, {
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

    return {getPreviewFavoriteList, addCardToFavorite, deleteCardToFavorite, getFavoriteList}
}
