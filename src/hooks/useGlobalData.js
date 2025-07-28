import {create} from 'zustand'
import {devtools} from "zustand/middleware";
import {useServerUser} from "./useServerUser";

const {getPageList, getStructureCatalogList, getPreviewCardList, getCatalogList, getPreviewFavoriteList, getPreviewBasketList} = useServerUser()

const useGlobalData = create(devtools(set => ({
    pageList: null,
    updatePageList: () => getPageList((result) => {
        set((state) => ({pageList: result, pageId: state.pageId === null ? result[0].id : state.pageId}));
    }),


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