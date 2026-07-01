import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../../hooks/useTelegram';
import { useServerUser } from '../../../hooks/useServerUser';
import useGlobalData from '../../../hooks/useGlobalData';
import Recommendations from '../../../shared/ui/Recommendations/Recommendations';
import DesktopFavoriteItem from './DesktopFavoriteItem';
import style from './DesktopFavorites.module.scss';

function countWord(n) {
    if (n % 10 === 1 && n % 100 !== 11) return '';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'а';
    return 'ов';
}

const DesktopFavorites = () => {
    const { user } = useTelegram();
    const navigate = useNavigate();
    const { getFavoriteList, deleteCardToFavorite } = useServerUser();
    const { updatePreviewFavoriteData, bufferCardsRecommendations } = useGlobalData();
    const [cardList, setCardList] = useState(null);

    if (cardList === null) {
        getFavoriteList(setCardList, user.id).then();
    }

    const handleDelete = async (itemId) => {
        await deleteCardToFavorite(() => {
            updatePreviewFavoriteData();
            getFavoriteList(setCardList, user.id);
        }, user.id, itemId);
    };

    if (cardList === null) {
        return (
            <div className={style.page}>
                <div className={style.loaderWrap}>
                    <div className="plup-loader" />
                </div>
            </div>
        );
    }

    if (cardList.length === 0) {
        return (
            <div className={style.page}>
                <div className={style.empty}>
                    <p className={style.emptyTitle}>В избранном ничего нет</p>
                    <button className={style.emptyBtn} onClick={() => navigate('/')}>
                        Перейти к покупкам
                    </button>
                </div>
                <Recommendations from="favorites" desktop data={bufferCardsRecommendations} />
            </div>
        );
    }

    return (
        <div className={style.page}>
            <div className={style.inner}>
                <div className={style.header}>
                    <h1 className={style.title}>Избранное</h1>
                    <span className={style.count}>
                        {cardList.length} товар{countWord(cardList.length)}
                    </span>
                </div>
                <div className={style.list}>
                    {cardList.map(item => (
                        <DesktopFavoriteItem
                            key={item.id}
                            item={item}
                            onDelete={() => handleDelete(item.id)}
                        />
                    ))}
                </div>
            </div>
            <Recommendations from="favorites" desktop data={bufferCardsRecommendations} />
        </div>
    );
};

export default DesktopFavorites;
