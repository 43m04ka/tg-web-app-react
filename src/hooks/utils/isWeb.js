import {isVk} from './isVk';
import {isTg} from './isTg';

export const isWeb = () => {
    return !isVk() && !isTg();
};