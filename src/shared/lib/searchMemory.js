import {forgetViewsWith, recallView, rememberView} from './viewMemory';

const FORM_KEY = 'search:form';

export const readSearchForm = () => recallView(FORM_KEY) || null;

export const writeSearchForm = (value) => rememberView(FORM_KEY, value);

export const resetSearchState = () => {
    forgetViewsWith('search:');
    forgetViewsWith('scroll:search:');
};
