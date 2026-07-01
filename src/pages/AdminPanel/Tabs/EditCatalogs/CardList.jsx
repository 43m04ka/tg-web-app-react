import React, {useState, useEffect} from 'react';
import s from "./CardList.module.scss";
import {useServer} from "../../useServer";
import EditDataCard from "../EditCards/EditData/EditDataCard";
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
import useData from "../../useData";

const CardList = ({catalogId, onReload, onClose}) => {

    const [cardList, setCardList] = useState([]);
    const [maxLength, setMaxLength] = useState(0);
    const [listNumber, setListNumber] = useState(1);
    const [editCardId, setEditCardId] = useState(null);

    const {updateCardData, getCardList} = useServer();
    const {authenticationData} = useData();

    const setResult = (result) => {
        setCardList(result.cardList || []);
        setMaxLength(result.len || 0);
    };

    useEffect(() => {
        getCardList(setResult, catalogId, 1).then();
    }, [catalogId]);

    const loadPage = (page) => {
        setListNumber(page);
        getCardList(setResult, catalogId, page).then();
    };

    const handleReload = () => {
        getCardList(setResult, catalogId, listNumber).then();
    };

    const handleChangeStatus = async (ids, onSale) => {
        for (const id of ids) {
            await updateCardData(() => {}, authenticationData, id, {onSale});
        }
        setTimeout(() => handleReload(), 150);
    };

    const handleDelete = async (id) => {
        await fetch('https://gwstorebot.ru/api/catalog/deleteProduct', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id})
        });
        setTimeout(() => handleReload(), 150);
    };

    return (
        <div>
            <PopUpWindow title="Список карт" onClose={onClose}>
                <div className={s['headerRow']}>
                    <div className={s['buttonGroup']}>
                        <button className={s['button']} onClick={handleReload}>⟳ Обновить</button>
                    </div>
                </div>

                <div className={s['tableWrap']}>
                    <table className={s['table']}>
                        <colgroup>
                            <col className={s['colName']}/>
                            <col className={s['colPrice']}/>
                            <col className={s['colStatus']}/>
                            <col className={s['colActions']}/>
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Цена</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cardList.map(card => (
                            <tr key={card.id}>
                                <td className={s['nameCell']} title={card.name}>{card.name}</td>
                                <td>{card.price}</td>
                                <td>
                                    <span className={card.onSale ? s['statusOn'] : s['statusOff']}>
                                        {card.onSale ? 'В продаже' : 'Снят'}
                                    </span>
                                </td>
                                <td onClick={e => e.stopPropagation()}>
                                    <div className={s['actionButtons']}>
                                        <button className={s['actionButton']}
                                                onClick={() => setEditCardId(card.id)}>
                                            Изменить
                                        </button>
                                        {card.onSale ? (
                                            <button className={`${s['actionButton']} ${s['deleteButton']}`}
                                                    onClick={() => handleChangeStatus([card.id], false)}>
                                                Снять
                                            </button>
                                        ) : (
                                            <button className={s['actionButton']}
                                                    onClick={() => handleChangeStatus([card.id], true)}>
                                                В продажу
                                            </button>
                                        )}
                                        <button className={`${s['actionButton']} ${s['deleteButton']}`}
                                                onClick={() => handleDelete(card.id)}>
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {cardList.length === 0 && (
                            <tr>
                                <td className={s['emptyCell']} colSpan={4}>Карты не найдены</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {maxLength > 1 && (
                    <div className={s['pagination']}>
                        {listNumber > 1 && (
                            <button className={s['pageBtn']} onClick={() => loadPage(listNumber - 1)}>‹</button>
                        )}
                        {listNumber > 1 && (
                            <button className={s['pageBtn']} onClick={() => loadPage(1)}>1</button>
                        )}
                        <button className={`${s['pageBtn']} ${s['pageBtnActive']}`}>{listNumber}</button>
                        {listNumber < maxLength && (
                            <button className={s['pageBtn']} onClick={() => loadPage(maxLength)}>{maxLength}</button>
                        )}
                        {listNumber < maxLength && (
                            <button className={s['pageBtn']} onClick={() => loadPage(listNumber + 1)}>›</button>
                        )}
                    </div>
                )}
            </PopUpWindow>

            {editCardId !== null && (
                <EditDataCard
                    cardId={editCardId}
                    onClose={() => setEditCardId(null)}
                    onReload={handleReload}
                />
            )}
        </div>
    );
};

export default CardList;
