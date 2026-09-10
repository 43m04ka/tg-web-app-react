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

export const fetchStartPages = () => httpPost('/getStartPageList', {});

export const createStartItem = (startPageData) => httpPost('/createStartPage', {startPageData});

export const updateStartItem = (id, updateData) => httpPost('/updateStartPage', {id, updateData});

export const deleteStartItem = (id) => httpPost('/deleteStartPage', {id});

export const fetchInfoBlocks = () => httpGet('/infoBlocks', {area: 'structure'});

export const createInfoBlock = (infoBlockData) => httpPost('/createInfoBlock', {infoBlockData});

export const updateInfoBlock = (id, updateData) => httpPost('/updateInfoBlock', {id, updateData});

export const deleteInfoBlock = (id) => httpPost('/deleteInfoBlock', {id});

export const fetchClues = () => httpGet('/allClue', {area: 'search'});

export const createClue = (clueData) => httpPost('/createSearchClue', {clueData});

export const updateClue = (id, updateData) => httpPost('/updateSearchClue', {id, updateData});

export const deleteClue = (id) => httpPost('/deleteSearchClue', {id});

export const refreshStructure = () => httpPost('/refresh-structure-data', {});

export const fetchPopular = () => httpPost('/getPopularList', {});

export const createPopular = ({platform, productId}) => httpPost('/createPopular', {platform, productId});

export const updatePopular = (id, updateData) => httpPost('/updatePopular', {id, updateData});

export const deletePopular = (id) => httpPost('/deletePopular', {id});

export const searchProducts = (search) => httpGet('/products', {query: {search, pageSize: 20}});
