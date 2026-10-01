import React from 'react';
import {Navigate} from 'react-router-dom';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {textPageRoute} from '../../shared/textPages/textPageModel';
import TextPageView from './TextPageView';
import {useTextPage} from '../../shared/textPages/useTextPages';
import style from './TextPages.module.scss';

const SKELETON_LINES = [92, 100, 84, 96, 70, 100, 88, 60];

export default function TextPageArticle({slug, section, onMissing, onLoaded}) {
    const {page, status, reload} = useTextPage(slug);

    React.useEffect(() => {
        if (page && onLoaded) onLoaded(page);
    }, [page, onLoaded]);

    if (status === 'loading') {
        return (
            <div className={style.article} aria-busy="true">
                <span className={`${style.skeleton} ${style.skeletonTitle}`}/>
                {SKELETON_LINES.map((width, index) => (
                    <span key={index} className={style.skeleton} style={{width: `${width}%`}}/>
                ))}
            </div>
        );
    }

    if (status === 'error') {
        return (
            <EmptyState
                tone="danger"
                icon="⚠"
                title="Не удалось загрузить"
                text="Проверьте связь и попробуйте ещё раз."
                actionLabel="Повторить"
                onAction={reload}
            />
        );
    }

    if (status === 'missing') {
        return (
            <EmptyState
                icon="?"
                title="Страница не найдена"
                text="Возможно, её переименовали или сняли с публикации."
                actionLabel="На главную"
                onAction={onMissing}
            />
        );
    }

    if (section && page.section !== section) return <Navigate to={textPageRoute(page)} replace/>;

    return <TextPageView page={page}/>;
}
