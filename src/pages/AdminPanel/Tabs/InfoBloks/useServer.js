import {adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = '/api/admin';
const URL_STRUCTURE = '/api/structure';

export function useServer() {

    const getInfoBlock = async (setResult) => {
        fetch(`${URL_STRUCTURE}/infoBlocks?time${new Date()}`, {
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
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(
                withJsonAuth({
                    authenticationData: authenticationData,
                    infoBlockData: infoBlockData,
                }),
            ),
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    const deleteInfoBlock = async (authenticationData, infoBlockId) => {
        fetch(`${URL}/deleteInfoBlock`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(
                withJsonAuth({
                    authenticationData: authenticationData,
                    id: infoBlockId,
                }),
            ),
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    return {getInfoBlock, createInfoBlock, deleteInfoBlock}

}
