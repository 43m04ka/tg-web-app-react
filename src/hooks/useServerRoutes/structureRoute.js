import {API_BASE_URL} from "./baseUrl";

// Ответы структуры иногда обрываются на середине (ERR_CONTENT_LENGTH_MISMATCH) —
// тогда fetch/json бросает, промис остаётся необработанным и данные молча теряются.
// Один повтор закрывает почти все такие обрывы, а необработанных промисов больше нет.
const fetchJsonResult = async (url, {retries = 1} = {}) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data?.result ?? null;
        } catch (error) {
            if (attempt === retries) {
                console.error(`Ошибка запроса ${url}:`, error);
                return null;
            }
        }
    }
    return null;
}

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

    const bySerialNumber = (list) =>
        Array.isArray(list) ? [...list].sort((a, b) => a.serialNumber - b.serialNumber) : null

    const getPageList = async (setResult) => {
        const result = await fetchJsonResult(`${API_BASE_URL}/api/structure/allPages?time=${Date.now()}`)
        const sorted = bySerialNumber(result)
        if (sorted) setResult(sorted)
    }

    const getStartPageList = async (setResult) => {
        const result = await fetchJsonResult(`${API_BASE_URL}/api/structure/allStartPages?time=${Date.now()}`)
        const sorted = bySerialNumber(result)
        if (sorted) setResult(sorted)
    }


    const getStructureCatalogList = async (setResult) => {
        const result = await fetchJsonResult(`${API_BASE_URL}/api/structure/allStructureBlocks?time=${Date.now()}`)
        if (result !== null) setResult(result)
    }

    const getPreviewCardList = async (setResult) => {
        const result = await fetchJsonResult(`${API_BASE_URL}/api/structure/mainPageProducts?time=${Date.now()}`)
        const sorted = bySerialNumber(result)
        if (sorted) setResult(sorted)
    }

    const getInfoBlocks = async (setResult) => {
        const result = await fetchJsonResult(`${API_BASE_URL}/api/structure/infoBlocks?time=${Date.now()}`)
        if (result !== null) setResult(result)
    }

    return {getStructureCatalogList, getPreviewCardList, getPageList, getStartPageList, getInfoBlocks, syncUser}
}
