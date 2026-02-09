import {create} from 'zustand'
import {devtools} from "zustand/middleware";
import {useServerUser} from "./useServerUser";
import {useTelegram} from "./useTelegram";


const {
    getPageList, getStructureCatalogList, getPreviewCardList, getCatalogList, getPreviewFavoriteList
} = useServerUser()
const {getBasketList} = useServerUser()
const {user} = useTelegram()

const useGlobalData = create(devtools(set => ({
    pageList: null,
    updatePageList: (data) => {
        if (typeof data === 'undefined') {
            getPageList((result) => {
                set(() => ({pageList: result}));
            })
        } else {
            set(() => ({pageList: data.sort((a, b) => a.serialNumber - b.serialNumber).filter(page => page.isHide === 1)}));
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
    }, user.id),

    catalogList: null,
    catalogStructureList: null,
    mainPageCards: null,
    updateCatalogList: (data) => {
        if (typeof data === 'undefined') {
            getCatalogList((result) => set(() => ({catalogList: result})))
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
    updatePreviewFavoriteData: () => getPreviewFavoriteList((result) => set(() => ({previewFavoriteData: result})), user.id),

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