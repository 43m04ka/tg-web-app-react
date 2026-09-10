import {http, httpGet, httpPost} from '../../platform/http';

export const fetchFolder = (path = '') => httpGet('/list', {area: 'hosting', query: {path}});

export const createFolder = ({folderName, parentPath = ''}) => httpPost('/folder', {folderName, parentPath}, {area: 'hosting'});

export const deleteFile = (filePath) => http('/file', {area: 'hosting', method: 'DELETE', body: {filePath}});

export const deleteFolder = (folderPath) => http('/folder', {area: 'hosting', method: 'DELETE', body: {folderPath}});

export const uploadFiles = ({files, folder = ''}) => {
    const form = new FormData();

    form.append('folder', folder);
    Array.from(files).slice(0, 10).forEach((file) => form.append('files', file));

    return http('/upload', {area: 'hosting', method: 'POST', form, timeoutMs: 120000});
};
