import {httpGet, httpPost} from '../../platform/http';

export const fetchPages = () => httpPost('/getPages', {});

export const createPage = (pageData) => httpPost('/createPage', {pageData});

export const updatePage = (pageId, updateData) => httpPost('/updatePageData', {pageId, updateData});

export const deletePage = (id) => httpPost('/deletePage', {id});

export const fetchBlocks = (pageId, group) => httpPost('/getStructureCatalogList', {pageId, group});

export const createBlock = (catalogData) => httpPost('/createStructureCatalog', {catalogData});

export const updateBlock = (catalogId, updateData) => httpPost('/updateStructureCatalog', {catalogId, updateData});

export const deleteBlock = (id) => httpPost('/deleteStructureCatalog', {id});

export const fetchPreviewCards = () => httpGet('/mainPageProducts', {area: 'structure'});

export const fetchCatalogs = () => httpGet('/allCatalogs', {area: 'catalog'});

export const fetchCatalogIcons = () => httpGet('/catalogIcons');

export const fetchBanners = () => httpPost('/getBannerList', {});

export const createBanner = (bannerData) => httpPost('/createBanner', {bannerData});

export const updateBanner = (id, updateData) => httpPost('/updateBanner', {id, updateData});

export const deleteBanner = (id) => httpPost('/deleteBanner', {id});

export const searchBannerSources = (query) => httpGet('/bannerSources', {query: {query}});

export const refreshStructure = () => httpPost('/refresh-structure-data', {});
