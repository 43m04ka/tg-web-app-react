import {create} from 'zustand'
import {devtools} from "zustand/middleware";
import {useServerUser} from "./useServerUser";
import {getUser} from "./useTelegram";


const {
    getPageList, getStructureCatalogList, getPreviewCardList, getCatalogList, getPreviewFavoriteList, getStartPageList
} = useServerUser()
const {getBasketList} = useServerUser()

// Страницы не привязаны к боту — отсеиваем только скрытые
const filterVisiblePages = (pages) => pages.filter(page => page.isHidden !== 1)

const useGlobalData = create(devtools((set, get) => ({
    internalUserId: null,
    setInternalUserId: (id) => set(() => ({internalUserId: id})),

    pageList: null,
    updatePageList: (data) => {
        if (typeof data === 'undefined') {
            getPageList((result) => {
                set(() => ({pageList: filterVisiblePages(result)}));
            })
        } else {
            if (data === true) {
                getPageList((result) => {
                    set(() => ({pageList: result}));
                }, data)
            } else {
                set(() => ({pageList: filterVisiblePages(data)}));
            }
        }
    },

    startPageList: [],
    updateStartPageList: (data) => {
        // Стартовые страницы приходят с index.html. Если сервер их не вложил
        // (или вложил пустыми) — только тогда идём в сеть, иначе стартовый экран
        // ждал бы лишний запрос там, где данные уже есть
        if (!Array.isArray(data) || data.length === 0) {
            getStartPageList((result) => {
                if (Array.isArray(result) && result.length > 0) {
                    set(() => ({startPageList: result}));
                }
            })
        } else {
            set(() => ({startPageList: data}));
        }
    },

    basket: [],
    updateBasket: (catalogList, pageId) => getBasketList((result) => {
        let catalogIdList = []
        catalogList.map(catalog => {
            if (catalog.structurePageId === pageId) {
                catalogIdList.push(catalog.id)
            }
        })

        let cardList = []
        result.map(card => {
            if (catalogIdList.includes(card.catalogId)) {
                cardList.push(card)
            }
        })
        set(() => ({basket: cardList}))
    }, get().internalUserId || getUser().id),

    addCardToBasketList: (cardData) => set((state) => {
        const exists = state.basket.some(card => card.id === cardData.id);
        if (exists) {
            return state;
        }
        return {
            basket: [...state.basket, { ...cardData, count: 1 }]
        };
    }),
    removeCardFromBasketList: (cardId) => set((state) => ({
        basket: state.basket.filter(card => card.id !== cardId)
    })),
    updateCardCountInBasketList: (cardId, count) => set((state) => ({
        basket: state.basket.map(card => 
            card.id === cardId ? { ...card, count } : card
        )
    })),

    catalogList: null,
    catalogStructureList: null,
    mainPageCards: null,
    updateCatalogList: (data, options) => {
        if (typeof data === 'undefined') {
            getCatalogList((result) => set(() => ({catalogList: result})), options)
        } else {
            set(() => ({catalogList: data}));
        }
    },
    updateCatalogStructureList: (data) => {
        if (typeof data === 'undefined') {
            getStructureCatalogList((result) => set(() => ({catalogStructureList: result})))
        } else {
            set(() => ({catalogStructureList: data}));
        }
    },
    updateMainPageCards: (data) => {
        if (typeof data === 'undefined') {
            getPreviewCardList((result) => set(() => ({mainPageCards: result})))
        } else {
            set(() => ({mainPageCards: data.sort((a, b) => a.serialNumber - b.serialNumber)}));
        }
    },

    previewFavoriteData: [],
    updatePreviewFavoriteData: () => getPreviewFavoriteList((result) => set(() => ({previewFavoriteData: result})), get().internalUserId || getUser().id),

    bufferCardsCatalog: [],
    setBufferCardsCatalog: (cards) => set(() => ({bufferCardsCatalog: cards})),
    bufferCardsRecommendations: [],
    setBufferCardsRecommendations: (cards) => set(() => ({bufferCardsRecommendations: cards})),

    pageId: -1,
    setPageId: (pageId) => set(() => ({pageId: pageId})),

    barIsVisible: true,
    setBarIsVisible: (boolean) => set(() => ({barIsVisible: boolean})),
})))

window.state = useGlobalData

export default useGlobalData


//{id:8116988141},
