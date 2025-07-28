import {create} from 'zustand'
import {devtools} from "zustand/middleware";

const useData = create(devtools(set => ({

    authenticationData:null,
    setAuthenticationData: (authenticationData) => set(() => ({authenticationData: authenticationData})),


    catalogStructureList:null,
    setCatalogList: (catalogList) => set(() => ({catalogStructureList: catalogList})),
})))

export default useData


