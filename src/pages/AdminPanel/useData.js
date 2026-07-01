import {create} from 'zustand'
import {devtools} from "zustand/middleware";

const useData = create(devtools(set => ({

    authenticationData: null,
    /** JWT с POST /api/admin/authentication; для запросов — Authorization: Bearer */
    adminAuthToken: null,
    setAuthenticationData: (authenticationData) =>
        set(() => ({
            authenticationData,
            ...(authenticationData === null ? {adminAuthToken: null} : {}),
        })),
    setAdminAuthToken: (adminAuthToken) => set(() => ({adminAuthToken})),

    catalogList: null,
    setCatalogList: (catalogList) => set(() => ({catalogList: catalogList})),
})))

export default useData


