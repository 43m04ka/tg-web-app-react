import {API_BASE_URL} from "./useServerRoutes/baseUrl";
import useData from "../pages/AdminPanel/useData";

const URL = `${API_BASE_URL}/api/admin`

export function useServer() {


    const authentication = async (data, setResult) => {
        const response = await fetch(URL + '/authentication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.status !== 200) {
            useData.getState().setAdminAuthToken(null);
            setResult(false);
            return;
        }
        try {
            const payload = await response.json();
            if (payload?.token) {
                useData.getState().setAdminAuthToken(payload.token);
            }
        } catch {
            /* ответ без JSON — как раньше, без токена */
        }
        setResult(true);
    }

    const getCategories = async (setResult) => {
        await fetch(URL + '/getCategories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const getSearch = async (searchString, tabId, setResult) => {
        await fetch(URL + '/getSearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({search: searchString, tabId: tabId})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const deleteCards = async (path, idList) => {
        await fetch(URL + '/deleteCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({path: path, idList: idList})
        })
    }

    const changeStatusCards = async (path, idList) => {
        await fetch(URL + '/changeStatusCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({path: path, idList: idList})
        })
    }

    const editCardPrice = async (cardId, newPriceList, oldPrice) => {
        await fetch(URL + '/editCardPrice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardId: cardId,
                newPriceList: newPriceList,
                oldPrice: oldPrice
            }),

        });
    };

    const getPreviewCards = async (setResult) => {
        await fetch(URL + '/getPreviewCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const getCatalogs = async (pageId, group, setResult) => {
        await fetch(URL + '/getCatalogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({pageId:pageId, group:group})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
            })
        })
    }


    const deletePage = async (id) => {
        await fetch(URL + '/deletePage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id})
        })
    }


    return {
        authentication,
        deleteCards,
        changeStatusCards,
        getCategories,
        getSearch,
        editCardPrice,
        deletePage,
        getPreviewCards,
    }
}
