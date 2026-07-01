import {ADMIN_API_URL, adminAuthHeadersJson, withJsonAuth} from './adminAuth';

const URL = ADMIN_API_URL;

export function useServer() {

    const getCardList = async (setResult, catalogId, listNumber) => {
        fetch(`${URL}/productList?time=${Date.now()}&catalogId=${catalogId}&listNumber=${listNumber}`, {
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

    const getCard = async (setResult, id) => {
        fetch(`https://gwstorebot.ru/api/product/${id}?time=${Date.now()}`, {
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

    const getCatalogList = async (setResult) => {
        await fetch(`${URL}/getCatalogList?time=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then(async (data) => {
                await setResult(data.result)
            })
        })
    }



    const deleteCard = async (setResult, authenticationData, cardId) => {
        await fetch(`${URL}/deleteCard`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, id: cardId})),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }



    const updateCardData = async (setResult, authenticationData, cardId, updateData) => {
        await fetch(`${URL}/updateCardData`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(
                withJsonAuth({authenticationData: authenticationData, cardId: cardId, updateData: updateData}),
            ),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const updateCatalogData = async (setResult, authenticationData, catalogId, updateData) => {
        await fetch(`${URL}/updateCatalogData`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(
                withJsonAuth({
                    authenticationData: authenticationData,
                    catalogId: catalogId,
                    updateData: updateData,
                }),
            ),
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }



    const searchForName = async (setResult, searchString) => {
        await fetch(`${URL}/searchForName?searchString=${searchString}&time=${Date.now()}`, {
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



    const updateAssociations = async (authenticationData) => {
        await fetch(URL + '/updateAssociations', {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData})),
        }).then();
    };

    /** Превью и слепок структуры для index.html (без updateAssociations). */
    const refreshStructureData = async (authenticationData) => {
        const body = authenticationData
            ? withJsonAuth({authenticationData})
            : withJsonAuth({});
        const res = await fetch(`${URL}/refresh-structure-data`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(body),
        });
        let data = {};
        try {
            data = await res.json();
        } catch {
            /* ignore */
        }
        return {ok: res.ok, status: res.status, data};
    };

    const setExchangeIndiaCatalog = async (authenticationData, catalogId) => {
        await fetch(URL + '/setExchangeIndiaCatalog', {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, id: catalogId})),
        });
    };


    const getAssociationsStatus = async (setResult) => {
        await fetch(URL + '/getAssociationsStatus?time='+Date.now(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.status, data.percent)
            })
        })
    }

    const getCatalogIcons = async (setResult) => {
        await fetch(URL + '/catalogIcons?time='+Date.now(), {
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

    return {
        getCardList, getCard, getCatalogList,
        updateCatalogData,
        updateCardData, updateAssociations, refreshStructureData,
        deleteCard,
        searchForName, setExchangeIndiaCatalog,
        getAssociationsStatus, getCatalogIcons}
}
