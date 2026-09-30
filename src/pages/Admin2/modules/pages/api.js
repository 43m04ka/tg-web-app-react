import {httpGet, httpPost} from '../../platform/http';

export const fetchTextPages = (section) => httpGet('/text-pages', {query: {section, limit: 500}});

export const fetchTextPage = (id) => httpGet(`/text-pages/${id}`);

export const saveTextPage = ({id, data}) => httpPost('/text-pages', {id, data});

export const deleteTextPage = (id) => httpPost('/text-pages/delete', {id});
