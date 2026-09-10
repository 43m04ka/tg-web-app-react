import {httpGet} from '../../platform/http';

export const fetchOverview = ({from, to}) => httpGet('/stats/overview', {query: {from, to}});
