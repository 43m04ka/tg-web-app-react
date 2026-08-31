import {ADMIN_API_URL, API_BASE_URL, adminAuthHeadersJson, withJsonAuth} from './adminAuth';

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
        fetch(`${API_BASE_URL}/api/product/${id}?time=${Date.now()}`, {
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



    /**
     * Сквозной список товаров: фильтры и постраничность считает сервер.
     *
     * Отдельно от searchForName: тот отдаёт максимум 20 совпадений по имени, и фильтровать
     * их на клиенте бессмысленно — отбор нужен по всей таблице, а не по верхушке выдачи.
     */
    const getProducts = async ({search, catalogId, onSale, type, visibility, page, pageSize} = {}) => {
        const params = new URLSearchParams();

        // Пустое значение не отправляем: на сервере это «фильтр не задан»
        if (search) params.set('search', search);
        if (catalogId) params.set('catalogId', String(catalogId));
        if (onSale === true || onSale === false) params.set('onSale', String(onSale));
        if (type) params.set('type', type);
        if (visibility) params.set('visibility', visibility);
        if (page) params.set('page', String(page));
        if (pageSize) params.set('pageSize', String(pageSize));
        params.set('time', String(Date.now()));

        const response = await fetch(`${URL}/products?${params.toString()}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) throw new Error('Не удалось загрузить список товаров');
        return response.json();
    };

    /** Какие типы товаров вообще встречаются — для выпадающего фильтра */
    const getProductFacets = async () => {
        const response = await fetch(`${URL}/products/facets?time=${Date.now()}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) throw new Error('Не удалось загрузить фильтры');
        return response.json();
    };

    /** Массовое изменение одним запросом вместо цикла по выделенным строкам */
    const bulkUpdateCards = async (authenticationData, ids, updateData) => {
        const response = await fetch(`${URL}/products/bulk-update`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, ids, updateData})),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Не удалось изменить товары');
        return data;
    };

    /** Массовое удаление одним запросом */
    const bulkDeleteCards = async (authenticationData, ids) => {
        const response = await fetch(`${URL}/products/bulk-delete`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, ids})),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Не удалось удалить товары');
        return data;
    };

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

    /** Когда запланировано отложенное обновление ассоциаций (или null) */
    const getAssociationsSchedule = async () => {
        const response = await fetch(`${URL}/associations/schedule?time=${Date.now()}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) throw new Error('Не удалось получить расписание');
        return response.json();
    };

    /** @param {number} runAt момент запуска, epoch ms */
    const scheduleAssociations = async (authenticationData, runAt) => {
        const response = await fetch(`${URL}/associations/schedule`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData, runAt})),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Не удалось запланировать обновление');
        return data;
    };

    const cancelAssociationsSchedule = async (authenticationData) => {
        const response = await fetch(`${URL}/associations/schedule/cancel`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),
            body: JSON.stringify(withJsonAuth({authenticationData})),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Не удалось снять задачу');
        return data;
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

    const getSystemSettings = async (setResult) => {
        fetch(`${URL}/settings/public?time=${Date.now()}`, {
            method: 'GET',
            headers: adminAuthHeadersJson(), 
        }).then(async response => {
            let answer = response.json();
            answer.then((data) => {
                setResult(data);
            });
        }).catch(err => console.error('[useServer getSettings]', err));
    };
    

    const updateSystemSetting = async (setResult, authenticationData, key, value, type) => {
        await fetch(`${URL}/settings/update`, {
            method: 'POST',
            headers: adminAuthHeadersJson(),

            body: JSON.stringify(withJsonAuth({
                authenticationData: authenticationData, 
                key: key,
                value: value,
                type: type
            })),
        }).then(async response => {
            let answer = response.json();
            answer.then((data) => {
                setResult(data);
            });
        }).catch(err => console.error('[useServer updateSetting]', err));
    };

    return {
        getCardList, getCard, getCatalogList,
        getProducts, getProductFacets,
        updateCatalogData,
        updateCardData, updateAssociations, refreshStructureData,
        getAssociationsSchedule, scheduleAssociations, cancelAssociationsSchedule,
        bulkUpdateCards, bulkDeleteCards,
        deleteCard,
        searchForName, setExchangeIndiaCatalog,
        getAssociationsStatus, getCatalogIcons,
        updateSystemSetting, getSystemSettings
    }
}
