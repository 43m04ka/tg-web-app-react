const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useServer() {

    const getClueList = async (setResult) => {
        fetch(`${URL}/getSearchClue?time=${Date.now()}`, {
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

    const createClue = async (authenticationData, clueData) => {
        fetch(`${URL}/createSearchClue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({
                authenticationData: authenticationData, clueData: clueData,
            })
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    const deleteClue = async (authenticationData, id) => {
        fetch(`${URL}/deleteSearchClue?time=${Date.now()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({
                authenticationData: authenticationData, id: id,
            })
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    return {getClueList, createClue, deleteClue}

}