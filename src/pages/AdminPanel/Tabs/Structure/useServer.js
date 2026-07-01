import {ADMIN_API_URL, adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = ADMIN_API_URL;

export function useServer() {

    const createPage = async (setResult, authenticationData, pageData) => {
        await fetch(URL + '/createPage', {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, pageData: pageData})),
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
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(
                withJsonAuth({authenticationData: authenticationData, pageId: pageId, updateData: updateData}),
            ),
        }).then(async response => {
            let answer = response.json()
            answer.then()
        })
    }

    const deletePageData = async (authenticationData, pageId) => {
        await fetch(`${URL}/deletePageData`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, pageId: pageId})),
        });
    };

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
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, catalogData: catalogData})),
        });
    };


    const deleteStructureCatalog = async (authenticationData, catalogId) => {
        await fetch(URL + '/deleteStructureCatalog', {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, id: catalogId})),
        });
    };

    const updateCatalogData = async (callback, authenticationData, catalogId, updateData) => {
        await fetch(URL + '/updateStructureCatalog', {
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
            answer.then(() => {
                if (callback) callback()
            })
        })
    }

    const getCatalogIcons = async (setIconsData) => {
        await fetch(URL + '/getCatalogIcons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                try {
                    setIconsData(data.result || [])
                }catch(err) {
                    setIconsData([])
                }
            })
        })
    }

    const getStartPageList = async (setResult) => {
        await fetch(`${URL}/getStartPageList`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({})),
        }).then(async (response) => {
            const answer = await response.json();
            setResult(answer.result || []);
        }).catch(() => setResult([]));
    };

    const createStartPage = async (authenticationData, startPageData) => {
        const response = await fetch(`${URL}/createStartPage`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, startPageData})),
        });
        return response.json();
    };

    const updateStartPage = async (authenticationData, id, updateData) => {
        const response = await fetch(`${URL}/updateStartPage`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, id, updateData})),
        });
        return response.json();
    };

    const deleteStartPage = async (authenticationData, id) => {
        const response = await fetch(`${URL}/deleteStartPage`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, id})),
        });
        return response.json();
    };

    return {
        deletePageData,
        updatePageData,
        createPage,
        getStructureCatalogList,
        createStructureCatalog,
        deleteStructureCatalog,
        updateCatalogData,
        getCatalogIcons,
        getStartPageList,
        createStartPage,
        updateStartPage,
        deleteStartPage,
    };

}
