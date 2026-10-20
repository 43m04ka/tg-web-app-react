import React, {forwardRef} from 'react';
import {useNavigate} from 'react-router-dom';

export const isPlainClick = (event) => event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey;

const RouteLink = forwardRef(function RouteLink({to, onOpen, children, ...rest}, ref) {
    const navigate = useNavigate();

    const onClick = (event) => {
        if (!isPlainClick(event)) return;

        event.preventDefault();

        if (onOpen) onOpen(event);
        else navigate(to);
    };

    return (
        <a ref={ref} href={to} onClick={onClick} {...rest}>
            {children}
        </a>
    );
});

export default RouteLink;
