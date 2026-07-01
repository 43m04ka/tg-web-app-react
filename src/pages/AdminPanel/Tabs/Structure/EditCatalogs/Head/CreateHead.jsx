import React, {useState} from 'react';
import style from '../../Structure.module.scss';
import {useServer} from "../../useServer";
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
import AP_CreateNewCatalog from "../AP_CreateNewCatalog/AP_CreateNewCatalog";
import useData from "../../../../useData";

const CreateHead = ({onClose, page, onReload, copyData = {}}) => {

    const newCatalog = [
        {argument: "serialNumber", placeholder: 'Порядковый номер', type: 'number', defaultValue: copyData.serialNumber || ''},
        {argument: "url", placeholder: 'url изображения', defaultValue: copyData.url || ''},
        [
            {
                name: 'Некликабельный', select: [
                    {argument: 'type', value: 'slider-non-clickable'},
                    {argument: "path", value: null}]
            },
            {
                name: 'На карту', select: [
                    {argument: 'type', value: 'slider-clickable'},
                    {argument: 'path', placeholder: 'id карты', tag: '/card/', defaultValue: copyData.path || ''}]
            },
            {
                name: 'На каталог', select: [
                    {argument: 'type', value: 'slider-clickable'},
                    {argument: 'path', placeholder: 'Путь до категории', tag: '/catalog/', defaultValue: copyData.path || ''}]
            },
            {
                name: 'На каталог-выбор', select: [
                    {argument: 'type', value: 'slider-clickable'},
                    {argument: 'path', placeholder: 'Путь до категории', tag: '/choice-catalog/', defaultValue: copyData.path || ''}]
            },
            {
                name: 'Ссылочный', select: [
                    {argument: 'type', value: 'slider-clickable'},
                    {argument: 'path', placeholder: 'Ссылка', defaultValue: copyData.path || ''}]
            }
        ],
        {argument: "group", value: 'head'},
        {argument: "structurePageId", value: page}
    ]

    const [infoLabel, setInfoLabel] = useState('*Поля обязательные для заполнения')
    const [json, setJson] = useState({})
    const {createStructureCatalog} = useServer()
    const {authenticationData} = useData()

    return (<PopUpWindow title={Object.keys(copyData).length > 0 ? 'Копировать элемент карусели' : 'Создать элемент карусели'} onClose={onClose}>

        {<AP_CreateNewCatalog data={newCatalog} setResult={setJson}/>}

        <div className={style['buttonPlace']}>
            <div className={style['buttonAccept']} onClick={async () => {
                await createStructureCatalog(authenticationData, json)
                onReload()
                onClose();
            }}>
                <div/>
                <p>{Object.keys(copyData).length > 0 ? 'Копировать' : 'Создать'}</p>
            </div>
        </div>
    </PopUpWindow>);
};

export default CreateHead;
