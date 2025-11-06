import {create} from 'zustand'
import {devtools} from "zustand/middleware";
import {useServerUser} from "./useServerUser";
import {useTelegram} from "./useTelegram";

const {getPageList, getStructureCatalogList, getPreviewCardList, getCatalogList, getPreviewFavoriteList} = useServerUser()
const {getBasketList} = useServerUser()
const {user} = useTelegram()


const useGlobalData = create(devtools(set => ({
    pageList: null,
    updatePageList: (bool) => getPageList((result) => {
        set((state) => ({pageList: result, pageId: state.pageId === null ? result[0].id : state.pageId}));
    }, bool),

    basket: null,
    updateBasket: (catalogList, pageId) =>
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
            set(() => ({basket: cardList}))
        }, user.id),

    catalogList: null,
    catalogStructureList: null,
    mainPageCards: null,
    updateCatalogList: () => getCatalogList((result) => set(() => ({catalogList: result}))),
    updateCatalogStructureList: () => getStructureCatalogList((result) => set(() => ({catalogStructureList: result}))),
    updateMainPageCards: () => getPreviewCardList((result) => set(() => ({mainPageCards: result}))),

    previewFavoriteData: [],
    updatePreviewFavoriteData: () => getPreviewFavoriteList((result) => set(() => ({previewFavoriteData: result})), user.id),


    pageId: -1,
    setPageId: (pageId) => set(() => ({pageId: pageId})),
})))

window.state = useGlobalData

export default useGlobalData


//{id:8116988141},