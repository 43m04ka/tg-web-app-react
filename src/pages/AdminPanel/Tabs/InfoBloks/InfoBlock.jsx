import React, {useEffect, useState} from 'react';
import {useServer} from "./useServer";
import useData from "../../useData";
import style from './InfoBlock.module.scss'
import CreateInfoBlock from "./CreateInfoBlock";

const InfoBlock = () => {

    const [blockList, setBlockList] = useState(null);
    const [createTabOpen, setCreateTabOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredList, setFilteredList] = useState([]);

    const {authenticationData} = useData();
    const {getInfoBlock, deleteInfoBlock} = useServer()

    useEffect(() => {
        if (blockList === null) {
            getInfoBlock(setBlockList).then()
        }
    }, [blockList]);

    useEffect(() => {
        if (blockList) {
            const filtered = blockList.filter(item =>
                item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.body?.toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredList(filtered);
        }
    }, [searchValue, blockList]);

    const handleDelete = async (id) => {
        await deleteInfoBlock(authenticationData, id);
        await getInfoBlock(setBlockList);
    };

    const handleReload = async () => {
        await getInfoBlock(setBlockList);
    };

    return (
        <div className={style['mainContainer']}>
            <div className={style['header']}>
                <div className={style['headerTitle']}>Информационные блоки</div>
                <div className={style['headerControls']}>
                    <input 
                        className={style['inputFind']} 
                        placeholder={'Поиск по названию или содержимому'}
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
                            <th>Заголовок</th>
                            <th>Содержимое</th>
                            <th>Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList && filteredList.map((item) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.body?.substring(0, 50)}...</td>
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
                                <td className={style['emptyCell']} colSpan={4}>Блоки не найдены</td>
                            </tr>
                        ) : ''}
                    </tbody>
                </table>
            </div>

            {createTabOpen ? <CreateInfoBlock 
                onClose={() => {
                    setCreateTabOpen(false);
                }} 
                setBlockList={setBlockList}
            /> : ''}
        </div>
    );
};

export default InfoBlock;
