import React, {useState} from 'react';
import useGlobalData from "../../../../../../../hooks/useGlobalData";
import SwitchLabel from "../../../Elements/SwitchLabel/SwitchLabel";
import BlockLabel from "../../../Elements/BlockLabel";
import ExcelReader from "../../../Blocks/ExcelReader";
import DropBox from "../../../Elements/DropBox/DropBox";
import useData from "../../../useData";
import {useServer} from "../../../useServer";
import PopUpWindow from "../../../Elements/PopUpWindow/PopUpWindow";
import style from "../../HistoryOrders/History.module.scss";

const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

const UploadData = ({onClose, onReload}) => {

    const {authenticationData} = useData();
    const {pageList, pageId, catalogList} = useGlobalData()

    const [gameType, setGameType] = useState(0)
    const [selectedCatalogId, setSelectedCatalogId] = useState(catalogList[0].id);
    const [addToAll, setAddToAll] = useState(0)
    const [onLoad, setOnLoad] = useState(false)
    const [left, setLeft] = useState(0)

    const [table, setTable] = useState(null)
    console.log(table)

    const uploadCards = async (authenticationData, cardList) => {
        await fetch(URL + '/uploadCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authenticationData: authenticationData, cardList: cardList})
        })
    }

    const setButtonTableClassic = async (cardList) => {
        let lastSerialNumber = 0
        cardList.map(card => {
            card.serialNumber = lastSerialNumber + 1
            lastSerialNumber += 1

            card.price = Math.round(card.price);
            card.oldPrice = Math.round(card.oldPrice);
            card.priceInOtherCurrency = Math.round(card.priceInOtherCurrency);

            card.catalogId = selectedCatalogId
            card.type = gameType === 1 ? 'game' : 'other'

            let lang = false
            let voice = false

            if (typeof card.language !== 'undefined' && typeof card.voice !== 'undefined') {
                lang = card.language.includes('Russian')
                voice = card.voice.includes('Russian')

                if (lang && voice) {
                    card.language = 'На русском языке'
                } else if (lang) {
                    card.language = 'Русские субтитры (текст)'
                } else {
                    card.language = 'Без перевода'
                }
            }
        })

        let size = 20;
        let subarray = [];
        for (let i = 0; i < Math.ceil(cardList.length / size); i++) {
            subarray[i] = cardList.slice((i * size), (i * size) + size);
        }
        setOnLoad(true)
        for (let i = 0; i < subarray.length; i++) {
            await setLeft((subarray.length - i) * 20)
            await uploadCards(authenticationData, subarray[i])
        }
        await setOnLoad(false)
    }
    if (onLoad) {
        return (<div className={'text-element'} style={{
            fontSize: '20px',
            marginTop: '30px',
            marginLeft: '30px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
        }}>
            Загрузка карт на сервер. Осталось {left} карт
        </div>)
    } else {
        if (catalogList !== null) {
            return (
                <PopUpWindow
                    title={`Загрузить новые карты`}>

                    <div>
                    <DropBox label={catalogList.map(catalog => {
                        catalog.name = catalog.path;
                        return catalog
                    })}
                             onChange={(index) => setSelectedCatalogId(catalogList[index].id)}/>
                    <SwitchLabel label={'Добавлять в общий каталог'}
                                 onChange={(value) => setAddToAll(value.target.checked)}/>
                    <SwitchLabel label={'Карты принадлежат типу игр'}
                                 onChange={(value) => setGameType(value.target.checked)}/>

                    <ExcelReader setButtonTable={setTable}/>
                    </div>
                    <div className={style['buttonPlace']}>
                        <div className={style['buttonAccept']}
                             onClick={() => {
                                 setButtonTableClassic(table).then();
                                 onReload();
                                 onClose();
                             }}>
                            <div/>
                            <p>Загрузить</p>
                        </div>

                        <div className={style['buttonCancel']}
                             onClick={() => {
                                 onClose()
                             }}>
                            <div/>
                            <p>Отмена</p>
                        </div>
                    </div>
                </PopUpWindow>
            );
        }
    }
};

export default UploadData;