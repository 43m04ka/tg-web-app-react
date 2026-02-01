const URL = '/api/admin'

export function useServer() {

    const getInfoBlock = async (setResult) => {
        fetch(`${URL}/getInfoBlock?time${new Date()}`, {
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

    const createInfoBlock = async (authenticationData, infoBlockData) => {
        fetch(`${URL}/createInfoBlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                authenticationData: authenticationData,
                infoBlockData: infoBlockData
            })
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    const deleteInfoBlock = async (authenticationData, infoBlockId) => {
        fetch(`${URL}/deleteInfoBlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                authenticationData: authenticationData,
                id: infoBlockId
            })
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    return {getInfoBlock, createInfoBlock, deleteInfoBlock}

}