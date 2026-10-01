import React, {useCallback, useEffect, useState} from 'react';
import {sectionNumber} from './tocModel';
import style from './TextToc.module.scss';

const ACTIVE_OFFSET = 140;

function useActiveSection(entries) {
    const [activeId, setActiveId] = useState(entries[0]?.id || null);

    useEffect(() => {
        let frame = 0;

        const measure = () => {
            frame = 0;
            let current = entries[0]?.id || null;

            for (const entry of entries) {
                const node = document.getElementById(entry.id);
                if (node && node.getBoundingClientRect().top <= ACTIVE_OFFSET) current = entry.id;
            }

            setActiveId(current);
        };

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };

        measure();
        document.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll);

        return () => {
            if (frame) cancelAnimationFrame(frame);
            document.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll);
        };
    }, [entries]);

    return [activeId, setActiveId];
}

export default function TextToc({entries, title = 'Содержание', className = ''}) {
    const [activeId, setActiveId] = useActiveSection(entries);

    const open = useCallback((event, id) => {
        event.preventDefault();

        const node = document.getElementById(id);
        if (!node) return;

        node.scrollIntoView({behavior: 'smooth', block: 'start'});
        setActiveId(id);
    }, [setActiveId]);

    return (
        <nav className={`${style.toc} ${className}`} aria-label={title}>
            <span className={style.title}>{title}</span>

            <ol className={style.list}>
                {entries.map((entry) => (
                    <li key={entry.id} className={entry.nested ? style.nested : undefined}>
                        <a
                            href={`#${entry.id}`}
                            className={entry.id === activeId ? `${style.link} ${style.active}` : style.link}
                            aria-current={entry.id === activeId ? 'location' : undefined}
                            onClick={(event) => open(event, entry.id)}
                        >
                            <span className={style.number}>{sectionNumber(entry.number) || '•'}</span>
                            <span className={style.label}>{entry.title}</span>
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
