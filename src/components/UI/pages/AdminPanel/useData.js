import {create} from 'zustand'
import {devtools} from "zustand/middleware";

const useData = create(devtools(set => ({

    authenticationData:null,
    setAuthenticationData: (authenticationData) => set(() => ({authenticationData: authenticationData})),


    catalogList:null,
    setCatalogList: (catalogList) => set(() => ({catalogList: catalogList})),
})))

export default useData


