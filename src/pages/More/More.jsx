import React, {useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact} from '../../shared/lib/haptic';
import {getTelegramObject} from '../../shared/lib/telegram';
import {ChevronIcon} from './MoreIcons';
import {menuForBot} from './moreMenu';
import style from './More.module.scss';

const greetingName = (user) => {
    const name = user?.first_name || user?.username;
    return name ? String(name).trim() : 'Гость';
};

export default function More() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const user = useSessionStore((state) => state.user);
    const botType = useSessionStore((state) => state.botType);
    const infoBlocks = useStructureStore((state) => state.infoBlocks);

    const name = greetingName(user);
    const groups = useMemo(() => menuForBot(botType), [botType]);

    const openLink = useCallback((url) => {
        if (!url) return;
        hapticImpact('light');

        const tg = getTelegramObject();
        if (typeof tg.openLink === 'function') tg.openLink(url);
        else window.open(url, '_blank', 'noopener');
    }, []);

    const press = useCallback((item) => {
        if (item.to) {
            hapticImpact('light');
            navigate(item.to);
            return;
        }

        openLink(item.url);
    }, [navigate, openLink]);

    return (
        <div
            className={style.screen}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`
            }}
        >
            <header className={style.head}>
                <span className={style.avatar} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
                <span className={style.headBody}>
                    <span className={style.hello}>Привет, {name} 👋</span>
                    <span className={style.helloNote}>
                        {user ? 'Заказы, избранное и справка — здесь' : 'Войдите, чтобы видеть заказы'}
                    </span>
                </span>
            </header>

            {infoBlocks?.length ? (
                <section className={style.section}>
                    <h2 className={style.sectionTitle}>Акции</h2>
                    <div className={style.card}>
                        {infoBlocks.map((block) => (
                            <button key={block.id} type="button" className={style.row}
                                    onClick={() => openLink(block.path)}>
                                <span className={style.rowBody}>
                                    <span className={style.rowLabel}>{block.name}</span>
                                    {block.body ? <span className={style.rowNote}>{block.body}</span> : null}
                                </span>
                                <span className={style.rowArrow} aria-hidden="true">↗</span>
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}

            {groups.map((group) => (
                <section key={group.key} className={style.section}>
                    {group.title ? <h2 className={style.sectionTitle}>{group.title}</h2> : null}

                    <div className={style.card}>
                        {group.items.map((item) => (
                            <button key={item.key} type="button" className={style.row}
                                    onClick={() => press(item)}>
                                <span className={style.rowIcon} style={{'--tone': item.color}}>
                                    <item.Icon/>
                                </span>
                                <span className={style.rowLabel}>{item.name}</span>
                                {item.to
                                    ? <ChevronIcon className={style.rowChevron}/>
                                    : <span className={style.rowArrow} aria-hidden="true">↗</span>}
                            </button>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
