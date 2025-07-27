import React, {useState} from 'react';
import useGlobalData from "../../../../../../hooks/useGlobalData";
import SwitchLabel from "../../Elements/SwitchLabel";
import BlockLabel from "../../Elements/BlockLabel";
import ExcelReader from "../../Blocks/ExcelReader";
import DropLabel from "../../Elements/DropLabel";
import useData from "../../useData";
import {useServer} from "../../useServer";

const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'

const UploadData = () => {

    const [gameType, setGameType] = useState(0)
    const [selectedCatalogId, setSelectedCatalogId] = useState(null)
    const [addToAll, setAddToAll] = useState(0)
    const [onLoad, setOnLoad] = useState(false)
    const [left, setLeft] = useState(0)

    const {catalogList, setCatalogList, authenticationData} = useData();
    const {getCatalogList} = useServer();
    const {pageList, pageId} = useGlobalData()

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
                <BlockLabel
                    label={`Загрузить новые карты ${pageList.map(page => {
                        return page.id === pageId ? page.name : null
                    }).filter(page => page !== null)[0].toLowerCase()}`}>

                    <DropLabel label={catalogList.map(catalog => {
                        catalog.label = catalog.path;
                        return catalog
                    })}
                               onChange={(index) => setSelectedCatalogId(catalogList[index].id)}/>
                    <SwitchLabel label={['Добавляем в общий каталог', 'Не добавляем в общий каталог']}
                                 onChange={(value) => setAddToAll(value)}/>
                    <SwitchLabel label={['Это карты игр', 'Это не карты игр']}
                                 onChange={(value) => setGameType(value)}/>

                    <ExcelReader setButtonTable={setButtonTableClassic}/>
                </BlockLabel>
            );
        } else {
            getCatalogList(setCatalogList).then()
            return (<div className={'plup-loader'} style={{
                marginTop: '25px', marginLeft: '25px'
            }}></div>)
        }
    }
};

export default UploadData;