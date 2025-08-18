const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useServer() {

    const getExchangeIndiaCardList = async (setResult) => {
        await fetch(URL + '/getExchangeIndiaCardList?time=' + Date.now(), {
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
    };

    const createExchangeIndiaCard = async (setUpdate, authenticationData, cardData) => {
        await fetch(URL + '/createExchangeIndiaCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },body: JSON.stringify({authenticationData:authenticationData, cardData:cardData}),
        }).then(()=>{setUpdate()})
    };

    const deleteExchangeIndiaCard = async (setUpdate, authenticationData, cardId) => {
        await fetch(URL + '/deleteExchangeIndiaCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },body: JSON.stringify({authenticationData:authenticationData, cardId:cardId}),
        }).then(()=>{setUpdate()})
    };

    return {getExchangeIndiaCardList, createExchangeIndiaCard, deleteExchangeIndiaCard};
}