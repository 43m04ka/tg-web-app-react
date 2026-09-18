import React, {useEffect, useState} from 'react';
import style from './Cover.module.scss';

export function useImageReady(src) {
    const [isReady, setReady] = useState(!src);

    useEffect(() => {
        if (!src) {
            setReady(true);
            return undefined;
        }

        const image = new Image();
        let isAlive = true;

        const finish = () => {
            if (isAlive) setReady(true);
        };

        image.onload = finish;
        image.onerror = finish;
        image.src = src;

        if (image.complete) finish();
        else setReady(false);

        return () => {
            isAlive = false;
            image.onload = null;
            image.onerror = null;
        };
    }, [src]);

    return isReady;
}

export default function Cover({src, position, className = '', children, ...rest}) {
    const isReady = useImageReady(src);

    return (
        <span className={`${style.cover} ${className}`} data-ready={isReady ? 'yes' : 'no'} {...rest}>
            <span
                className={style.image}
                style={src ? {backgroundImage: `url(${src})`, backgroundPosition: position || 'center'} : undefined}
                aria-hidden="true"
            />
            {children}
        </span>
    );
}
