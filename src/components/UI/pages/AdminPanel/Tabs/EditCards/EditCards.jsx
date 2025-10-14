import React, {useState} from 'react';
import EditCard from "../../Blocks/EditCard";
import {useServer} from "../../useServer";
import style from "./EditCards.module.scss";
import ButtonLine from "../../Elements/ButtonLine/ButtonLine";
import List from "../../Elements/List/List";
import useData from "../../useData";
import UploadData from "./UploadData/UploadData";


const EditCards = () => {

    const {searchForName, updateCardData} = useServer()
    const {authenticationData} = useData()

    const [cardList, setCardList] = useState([])
    const [selectCardId, setSelectCardId] = useState(-1)
    const [searchInputValue, setSearchInputValue] = useState('')

    const [uploadCard, setUploadCard] = useState(false);

    const [listButtonData, setListButtonData] = useState([
        {name: 'Обновить', status: true, key: 'reload'},
        {name: 'Изменить', status: false, key: 'edit'},
        {name: 'Включить в продажу', status: false, key: 'changeStatusTrue'},
        {name: 'Убрать с продажи', status: false, key: 'changeStatusFalse'},
    ])

    const [editTabOpen, setEditTabOpen] = useState(false);
    const [cardId, setCardId] = React.useState(-1);
    const [selectList, setSelectList] = useState([]);

    if (listButtonData[1].status !== (selectList.length === 1)) {
        let newValue = listButtonData
        newValue[1].status = selectList.length === 1;
        setListButtonData(listButtonData);
    }

    if (listButtonData[2].status !== (selectList.length > 0)) {
        let newValue = listButtonData
        newValue[2].status = selectList.length > 0;
        newValue[3].status = selectList.length > 0;
        setListButtonData(listButtonData);
    }

    const cap = {
        name: ['Имя', 'Id', 'Цена', 'Статус'],
        key: ['name', 'id', 'price', (item) => {
            return item.onSale ? 'В продаже' : 'Нет в продаже'
        }],
    }

    const positionOptionsList = {
        name: ['Изменить'],
        key: ['edit'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'edit':
                setEditTabOpen(true)
                setCardId(selectList[0])
                break;
            case 'changeStatusFalse':
                onChangeStatus(selectList, false).then()
                break;
            case 'changeStatusTrue':
                onChangeStatus(selectList, true).then()
                break;
            case 'reload':
                searchForName(setCardList, searchInputValue).then();
                break;
            default:
                break;
        }
    }

    const returnOptionList = (option, id) => {
        switch (option) {
            case 'edit':
                setEditTabOpen(true)
                setCardId(id)
                break;
            case 'changeStatusFalse':
                onChangeStatus([id], false).then()
                break;
            case 'changeStatusTrue':
                onChangeStatus([id], true).then()
                break;
            default:
                break;
        }
    }

    const onChangeStatus = async (listId, bool) => {
        for await (const id of listId) {
            await updateCardData(() => {
            }, authenticationData, id, {onSale: bool})
        }
        await searchForName(setCardList, searchInputValue).then()
        await setSelectList([])
    }

    return (
        <div className={style['mainContainer']}>
            <div className={style['header']}>
                <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                    <input className={style['inputFind']} placeholder={'Поиск'}
                           onChange={async (event) => {
                               await searchForName(setCardList, event.target.value);
                               setSearchInputValue(event.target.value)
                               setSelectList([])
                           }}/>
                    <ButtonLine listButtonData={listButtonData} returnOptions={returnOptionsButtonLine}/>
                    <div className={style['buttonUpload']} onClick={() => {
                        setUploadCard(true);
                    }}>
                        <div/>
                        <p>Загрузить новые карты</p>
                    </div>
                </div>

            </div>

            {cardList !== null ? (
                <List listData={cardList} cap={cap} positionOptions={positionOptionsList}
                      returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
                      checkBoxType={'any'}/>) : ''}

            {editTabOpen ? <EditCard onClose={() => {
                setEditTabOpen(false);
            }} onReload={() => searchForName(setCardList, searchInputValue).then()} cardId={cardId}/> : ''}

            {uploadCard ? <UploadData onClose={() => {
                setUploadCard(false);
            }} onReload={() => searchForName(setCardList, searchInputValue).then()}/> : ''}
        </div>);

};


export default EditCards;


// const onReload = async () => {await searchForName(setCardList, searchInputValue)}
//
// return (
//     <div>
//         <BlockLabel label={'Поиск карты'}>
//             <InputLabel label={'Имя товара'} placeholder={'FC 25'} onChange={(e) => setSearchInputValue(e.currentTarget.value)} />
//             <ButtonLabel label={'Поиск'} onClick={onReload}/>
//         </BlockLabel>
//         <BlockLabel label={'Результат'} onReload={onReload}>
//             {cardList === null || cardList.length === 0 ? (<div className={styles['card-choice-empty']}>
//                 Ничего не найдено
//             </div>) : cardList.map(card => (<div
//                 className={`${styles['card-choice-block']} ${selectCardId === card.id ? styles['card-choice-active'] : ''}`}
//                 key={card.id} onClick={() => setSelectCardId(card.id)}>
//                 <div className={styles['card-choice-label']}>
//                     {card.name}</div>
//                 <div
//                     className={styles['card-choice-btn']}>
//                     {selectCardId === card.id ? '> Выбран ˂' : '» Выбрать «'}</div>
//             </div>))}
//             {selectCardId !== -1 ? <>
//                 <SeparatorLabel label={'Редактирование карты'}/>
//                 <div>
//                     {selectCardId !== -1 ? <EditCard onReload={onReload} cardId={selectCardId}/> : ''}
//                 </div>
//             </> : ''}
//         </BlockLabel>
//
//     </div>
// );
// };