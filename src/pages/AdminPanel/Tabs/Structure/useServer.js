import {ADMIN_API_URL, adminAuthHeadersJson, withJsonAuth} from '../../adminAuth';

const URL = ADMIN_API_URL;

export function useServer() {

    // Отказ сервера эти три ручки раньше проглатывали молча: ответ не проверялся вовсе,
    // поэтому форма одинаково показывала успех и когда страница сохранилась,
    // и когда сервер ответил «нет доступа».
    const throwIfFailed = async (response, fallback) => {
        if (response.ok) return;

        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || fallback);
    };

    const createPage = async (setResult, authenticationData, pageData) => {
        const response = await fetch(URL + '/createPage', {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, pageData: pageData})),
        });

        await throwIfFailed(response, 'Не удалось создать страницу');

        const data = await response.json().catch(() => ({}));
        setResult?.(data.result);
    };

    const updatePageData = async (authenticationData, pageId, updateData) => {
        const response = await fetch(`${URL}/updatePageData`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(
                withJsonAuth({authenticationData: authenticationData, pageId: pageId, updateData: updateData}),
            ),
        });

        await throwIfFailed(response, 'Не удалось сохранить страницу');
    }

    const deletePageData = async (authenticationData, pageId) => {
        const response = await fetch(`${URL}/deletePage`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, id: pageId})),
        });

        await throwIfFailed(response, 'Не удалось удалить страницу');
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
        const response = await fetch(URL + '/createStructureCatalog', {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, catalogData: catalogData})),
        });

        await throwIfFailed(response, 'Не удалось создать блок');
    };


    const deleteStructureCatalog = async (authenticationData, catalogId) => {
        const response = await fetch(URL + '/deleteStructureCatalog', {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData: authenticationData, id: catalogId})),
        });

        await throwIfFailed(response, 'Не удалось удалить блок');
    };

    const updateCatalogData = async (callback, authenticationData, catalogId, updateData) => {
        const response = await fetch(URL + '/updateStructureCatalog', {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(
                withJsonAuth({
                    authenticationData: authenticationData,
                    catalogId: catalogId,
                    updateData: updateData,
                }),
            ),
        });

        await throwIfFailed(response, 'Не удалось сохранить блок');
        if (callback) callback();
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

    // Эти четыре ручки отказ сервера тоже проглатывали: create/update/delete возвращали
    // response.json() без проверки статуса, а список при ошибке молча становился пустым —
    // «нет доступа» и «элементов нет» выглядели на экране одинаково
    const getStartPageList = async () => {
        const response = await fetch(`${URL}/getStartPageList`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({})),
        });

        await throwIfFailed(response, 'Не удалось загрузить стартовый экран');

        const data = await response.json().catch(() => ({}));
        return data.result || [];
    };

    const createStartPage = async (authenticationData, startPageData) => {
        const response = await fetch(`${URL}/createStartPage`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, startPageData})),
        });

        await throwIfFailed(response, 'Не удалось создать элемент');
    };

    const updateStartPage = async (authenticationData, id, updateData) => {
        const response = await fetch(`${URL}/updateStartPage`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, id, updateData})),
        });

        await throwIfFailed(response, 'Не удалось сохранить элемент');
    };

    const deleteStartPage = async (authenticationData, id) => {
        const response = await fetch(`${URL}/deleteStartPage`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, id})),
        });

        await throwIfFailed(response, 'Не удалось удалить элемент');
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
