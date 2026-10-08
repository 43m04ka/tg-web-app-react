import {httpGet, httpPost} from '../../platform/http';

export const fetchDesktopShelves = () => httpPost('/getDesktopShelfList', {});

export const createDesktopShelf = (shelfData) => httpPost('/createDesktopShelf', {shelfData});

export const updateDesktopShelf = (id, updateData) => httpPost('/updateDesktopShelf', {id, updateData});

export const deleteDesktopShelf = (id) => httpPost('/deleteDesktopShelf', {id});

export const fetchAllBlocks = () => httpGet('/allStructureBlocks', {area: 'structure'});
