import {useCallback} from "react";

const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

export function useServer() {


    const authentication = async (data, navigate) => {
        await fetch(URL + '/authentication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(async response => {
            if (response.status === 200) {
                navigate('/admin-panel?login=' + data.login + '&password=' + data.password)
            }
        })
    }


    const uploadCards = async (data) => {
        await fetch(URL + '/uploadCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
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

    const getPages = async (setResult) => {
        await fetch(URL + '/getPages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
            })
        })
    }

    const getCatalogs = async (pageId, group, setResult) => {
        await fetch(URL + '/getCatalogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({pageId: pageId, group: group})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
            })
        })
    }

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


    const deletePage = async (id) => {
        await fetch(URL + '/deletePage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id})
        })
    }

    const deleteCatalog = async (id) => {
        await fetch(URL + '/deleteCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id})
        })
    }

    const createPage = async (data) => {
        await fetch(URL + '/createPage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
    };

    const findCardsByCatalog = async (catalog, setResult) => {
        await fetch(URL + '/findCardsByCatalog?catalog='+catalog+'', {
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

    const createCatalog = async ({pageId, group, type, name, serialNumber, path, url, backgroundColor, deleteDate}) => {
        await fetch(URL + '/createCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pageId: pageId,
                group: group,
                type: type,
                name: name || null,
                serialNumber: serialNumber,
                path: path || null,
                url: url || null,
                backgroundColor: backgroundColor || null,
                deleteDate: deleteDate || null
            })
        })
    };


    return {
        authentication,
        uploadCards,
        deleteCards,
        changeStatusCards,
        getCategories,
        getSearch,
        editCardPrice,
        getPages,
        deletePage,
        deleteCatalog,
        createPage,
        getCatalogs,
        createCatalog,
        getPreviewCards,
        findCardsByCatalog
    }
}


//
//
// if (method === 'getDataAdmin') {
//     setDataStructure(prom.structure)
//     let DataCat = []
//     for (let i = 0; i < prom.allCategory.length; i++) {
//         DataCat.push({path: prom.allCategory[i], isSale: prom.isSaleArr[i]})
//     }
//     setDataCategory(DataCat)
//     setStatus(2)
// } else if (method === 'getSearch') {
//     setDataCards(prom.cards)
// } else if (method === 'changeStatus' || method === 'delete' || method === 'editPriceCard') {
//     try {
//         dataRequestDatabase.method = 'getSearch'
//         dataRequestDatabase.data = {str: searchInput.current.value, page: page}
//         await sendRequestDatabase()
//     } catch (e) {
//         await onReload()
//     }
//     setStatus(2)
// } else if (method === 'getOrderHistory') {
//     setDataOrderHistory(prom.allOrders)
// }