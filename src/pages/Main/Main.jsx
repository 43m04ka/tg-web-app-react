import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import BannerCarousel from './BannerCarousel';
import {selectPageBanners} from './bannerFormat';
import style from './Main.module.scss';

export default function Main() {
    const navigate = useNavigate();
    const {contentSafeAreaInset} = useAppInsets();

    const pageId = useSessionStore((state) => state.pageId);
    const pages = useStructureStore((state) => state.pages);
    const banners = useStructureStore((state) => state.banners);
    const page = pages?.find((candidate) => candidate.id === pageId);

    return (
        <div
            className={style.screen}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`
            }}
        >
            <BannerCarousel items={selectPageBanners(banners, pageId)}/>

            <div className={style.intro}>
                <div className={style.badge}>Раздел в разработке</div>
                <h1 className={style.title}>{page?.title || 'Каталог'}</h1>
                <p className={style.text}>
                    Витрина выбрана. Каталог, карточка товара и корзина появятся здесь на следующих этапах редизайна.
                </p>
                <button type="button" className={style.button} onClick={() => navigate('/')}>
                    Сменить витрину
                </button>
            </div>
        </div>
    );
}
