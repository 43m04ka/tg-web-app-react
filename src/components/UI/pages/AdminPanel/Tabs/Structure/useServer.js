const URL = '/api/admin'

export function useServer() {

    const createPage = async (setResult, authenticationData, pageData) => {
        await fetch(URL + '/createPage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, pageData:pageData})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    };

    const updatePageData = async (authenticationData, pageId, updateData) => {
        await fetch(`${URL}/updatePageData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, pageId:pageId, updateData:updateData})
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    const getStructureCatalogList = async (pageId, group, setResult) => {
        await fetch(URL + '/getStructureCatalogList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({pageId:pageId, group:group})
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                try {
                    setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
                }catch(err) {
                    setResult([])
                }
            })
        })
    }


    const createStructureCatalog = async (authenticationData, catalogData) => {
        await fetch(URL + '/createStructureCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, catalogData:catalogData})
        })
    };


    const deleteStructureCatalog = async (authenticationData, catalogId) => {
        await fetch(URL + '/deleteStructureCatalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData:authenticationData, id: catalogId})
        })
    }

    return {updatePageData, createPage, getStructureCatalogList, createStructureCatalog, deleteStructureCatalog}

}