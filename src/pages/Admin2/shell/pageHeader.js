import {useEffect, useState} from 'react';

const EMPTY = {title: '', subtitle: ''};

const listeners = new Set();

let header = EMPTY;

const emit = () => listeners.forEach((listener) => listener(header));

export const HEADER_ACTIONS_ID = 'a2-header-actions';

export const setPageHeader = (next) => {
    header = next || EMPTY;
    emit();
};

export const usePageHeaderValue = () => {
    const [value, setValue] = useState(header);

    useEffect(() => {
        listeners.add(setValue);
        setValue(header);
        return () => listeners.delete(setValue);
    }, []);

    return value;
};

export const usePageHeader = (title, subtitle = '') => {
    useEffect(() => {
        setPageHeader({title, subtitle});
        return () => setPageHeader(EMPTY);
    }, [title, subtitle]);
};
