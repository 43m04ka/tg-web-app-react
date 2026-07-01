import {API_BASE_URL} from "./baseUrl";

export function structureRoute(){

    const syncUser = async (userData, setResult) => {
        let finalChatId = String(userData.id);
        if (userData.platform === 'web') {
            try {
                let ipRes = await fetch('https://api.ipify.org?format=json');
                let ipData = String((await ipRes.json()).ip)
                finalChatId = ipData
            } catch (e) {
                console.error("Failed to fetch IP", e);
            }
        }
        await fetch(`${API_BASE_URL}/api/structure/syncUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatId: finalChatId,
                username: userData.username || userData.first_name || '',
                platform: userData.platform || 'tg'
            })
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                if (data && data.result) {
                    setResult(data.result)
                }
            })
        }).catch(e => console.error('Error syncing user:', e))
    }

    const getPageList = async (setResult, hide) => {
        await fetch(`${API_BASE_URL}/api/structure/allPages?time=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                let result = data.result.sort((a, b) => a.serialNumber - b.serialNumber)
                setResult(result)
            })
        })
    }


    const getStructureCatalogList = async (setResult) => {
        await fetch(`${API_BASE_URL}/api/structure/allStructureBlocks?time=${Date.now()}`, {
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

    const getPreviewCardList = async (setResult) => {
        await fetch(`${API_BASE_URL}/api/structure/mainPageProducts?time=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
            })
        })
    }

    const getInfoBlocks = async (setResult) => {
        await fetch(`${API_BASE_URL}/api/structure/infoBlocks?time${new Date()}`, {
            method: 'GET', headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    return {getStructureCatalogList, getPreviewCardList, getPageList, getInfoBlocks, syncUser}
}
