import {create} from 'zustand'
import {devtools} from "zustand/middleware";
import {useServerUser} from "./useServerUser";
import {useState} from "react";

const {getPageList, getStructureCatalogList, getPreviewCardList} = useServerUser()

const useGlobalData = create(devtools(set => ({
    pageList: null,
    updatePageList: () => getPageList((result) => {
        set((state) => ({pageList: result, pageId: state.pageId === null? result[0].id : state.pageId}));
    }),

    catalogList: [],
    mainPageCards: [],
    updateCatalogList: () => getStructureCatalogList((result) => set(() => ({catalogList: result}))),
    updateMainPageCards: () => getPreviewCardList((result) => set(() => ({mainPageCards: result}))),

    pageId: null,
    setPageId: (pageId) => set(() => ({pageId: pageId})),
})))

window.state = useGlobalData

export default useGlobalData


//{id:8116988141},