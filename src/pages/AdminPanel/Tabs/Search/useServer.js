import {adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = '/api/admin';
const URL_SEARCH = '/api/search';

export function useServer() {

    const getClueList = async (setResult) => {
        fetch(`${URL_SEARCH}/allClue?time=${Date.now()}`, {
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
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(
                withJsonAuth({
                    authenticationData: authenticationData,
                    clueData: clueData,
                }),
            ),
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    const deleteClue = async (authenticationData, id) => {
        fetch(`${URL}/deleteSearchClue?time=${Date.now()}`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, id: id})),
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    return { getClueList, createClue, deleteClue }

}