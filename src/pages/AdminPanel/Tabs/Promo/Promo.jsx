import React, {useEffect, useState} from 'react';
import {useServer} from "./useServer";
import useData from "../../useData";
import style from './Promo.module.scss'
import CreatePromo from "./CreatePromo";

const Promo = () => {

    const [promoList, setPromoList] = useState(null);
    const [createTabOpen, setCreateTabOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredList, setFilteredList] = useState([]);

    const {authenticationData} = useData();
    const {getPromoList, deletePromo} = useServer()

    useEffect(() => {
        if (promoList === null) {
            getPromoList(authenticationData, setPromoList).then()
        }
    }, [promoList, authenticationData]);

    useEffect(() => {
        if (promoList) {
            const filtered = promoList.filter(item =>
                item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.percent?.toString().includes(searchValue)
            );
            setFilteredList(filtered);
        }
    }, [searchValue, promoList]);

    const handleDelete = async (id) => {
        await deletePromo(authenticationData, id);
        await getPromoList(authenticationData, setPromoList);
    };

    const handleReload = async () => {
        await getPromoList(authenticationData, setPromoList);
    };

    return (
        <div className={style['mainContainer']}>
            <div className={style['header']}>
                <div className={style['headerTitle']}>Промокоды</div>
                <div className={style['headerControls']}>
                    <input 
                        className={style['inputFind']} 
                        placeholder={'Поиск по названию или процентам'}
                        value={searchValue}
                        onChange={(event) => {
                            setSearchValue(event.target.value);
                        }}
                    />
                    <div className={style['buttonGroup']}>
                        <button className={style['button']} onClick={() => setCreateTabOpen(true)}>
                            <p>+ Создать</p>
                        </button>
                        <button 
                            className={style['button']} 
                            onClick={handleReload}
                        >
                            <p>⟳ Обновить</p>
                        </button>
                    </div>
                </div>
            </div>

            <div className={style['tableWrapMain']}>
                <table className={style['table']}>
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Процент (%)</th>
                            <th>Общее кол-во (шт.)</th>
                            <th>Личное кол-во (шт.)</th>
                            <th>Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList && filteredList.map((item) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.percent}</td>
                                <td>{item.totalNumberUses}</td>
                                <td>{item.personalNumberUses}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className={style['actionButtons']}>
                                        <button 
                                            className={`${style['actionButton']} ${style['deleteButton']}`}
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredList && filteredList.length === 0 ? (
                            <tr>
                                <td className={style['emptyCell']} colSpan={5}>Промокоды не найдены</td>
                            </tr>
                        ) : ''}
                    </tbody>
                </table>
            </div>

            {createTabOpen ? <CreatePromo 
                onClose={() => {
                    setCreateTabOpen(false);
                }} 
                setPromoList={setPromoList}
            /> : ''}
        </div>
    );
};

export default Promo;
