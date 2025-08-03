import {create} from 'zustand'
import {devtools} from "zustand/middleware";
import {useServerUser} from "./useServerUser";
import {useTelegram} from "./useTelegram";
import * as catalogList from "rxjs";

const {getPageList, getStructureCatalogList, getPreviewCardList, getCatalogList, getPreviewFavoriteList, getPreviewBasketList} = useServerUser()
const {getBasketList} = useServerUser()
const {user} = useTelegram()


const useGlobalData = create(devtools(set => ({
    pageList: null,
    updatePageList: () => getPageList((result) => {
        set((state) => ({pageList: result, pageId: state.pageId === null ? result[0].id : state.pageId}));
    }),

    counterBasket: 0,
    updateCounterBasket: (catalogList, pageId) =>
        getBasketList((result)=> {
            let catalogIdList = []
            catalogList.map(catalog=>{
                if(catalog.structurePageId === pageId){
                    catalogIdList.push(catalog.id)
                }
            })

            let cardList = []
            result.map(card=>{
                if(catalogIdList.includes(card.catalogId)){
                    cardList.push(card)
                }
            })
            set(() => ({counterBasket: cardList.length}))
        }, user.id),

    catalogList: [],
    catalogStructureList: [],
    mainPageCards: [],
    updateCatalogList: () => getCatalogList((result) => set(() => ({catalogList: result}))),
    updateCatalogStructureList: () => getStructureCatalogList((result) => set(() => ({catalogStructureList: result}))),
    updateMainPageCards: () => getPreviewCardList((result) => set(() => ({mainPageCards: result}))),

    previewBasketData: [],
    previewFavoriteData: [],
    updatePreviewBasketData: (id) => getPreviewBasketList((result) => set(() => ({previewBasketData: result})), id),
    updatePreviewFavoriteData: (id) => getPreviewFavoriteList((result) => set(() => ({previewFavoriteData: result})), id),


    pageId: null,
    setPageId: (pageId) => set(() => ({pageId: pageId})),
})))

window.state = useGlobalData

export default useGlobalData


//{id:8116988141},