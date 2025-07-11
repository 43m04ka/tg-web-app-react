import {create} from 'zustand'
import {devtools} from "zustand/middleware";
import {useServerUser} from "./useServerUser";

const {getPageList, getCatalogList, getPreviewCardList} = useServerUser()

const useGlobalData = create(devtools(set => ({
    pageList: null,
    updatePageList: () => getPageList((result) => set(() => ({pageList: result}))),

    catalogList: [],
    mainPageCards: [],
    updateCatalogList: () => getCatalogList((result) => set(() => ({catalogList: result}))),
    updateMainPageCards: () => getPreviewCardList((result) => set(() => ({mainPageCards: result}))),

    pageId: null,
    setPageId: (pageId) => set(() => ({pageId: pageId})),
})))

window.state = useGlobalData

export default useGlobalData


//{id:8116988141},