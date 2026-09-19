import {createContext, useContext} from 'react';

const FALLBACK = {scopeId: null, setScopeId: () => {}};

export const StorefrontScopeContext = createContext(null);

export function useStorefrontScope() {
    return useContext(StorefrontScopeContext) || FALLBACK;
}
