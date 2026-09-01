import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {HEADER_ACTIONS_ID} from './pageHeader';

export default function HeaderActions({children}) {
    const [node, setNode] = useState(null);

    useEffect(() => {
        setNode(document.getElementById(HEADER_ACTIONS_ID));
    }, []);

    return node ? createPortal(children, node) : null;
}
