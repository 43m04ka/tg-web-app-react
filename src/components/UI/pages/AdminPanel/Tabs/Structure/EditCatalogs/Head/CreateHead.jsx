import React, {useState} from 'react';
import style from '../../Structure.module.scss';
import {useServer} from "../../useServer";
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
import AP_CreateNewCatalog from "../AP_CreateNewCatalog/AP_CreateNewCatalog";
import useData from "../../../../useData";

const CreateHead = ({onClose, page, onReload}) => {

    const newCatalog = [
        {argument: "serialNumber", placeholder: 'Порядковый номер', type: 'number'},
        {argument: "url", placeholder: 'url изображения'},
        [
            {
                name: 'Некликабельный', select: [
                    {argument: 'type', value: 'slider-non-clickable'},
                    {argument: "path", value: null}]
            },
            {
                name: 'На карту', select: [
                    {argument: 'type', value: 'slider-clickable'},
                    {argument: 'path', placeholder: 'id карты', tag: '/card/'}]
            },
            {
                name: 'На каталог', select: [
                    {argument: 'type', value: 'slider-clickable'},
                    {argument: 'path', placeholder: 'Путь до категории', tag: '/catalog/'}]
            },
            {
                name: 'На каталог-выбор', select: [
                    {argument: 'type', value: 'slider-clickable'},
                    {argument: 'path', placeholder: 'Путь до категории', tag: '/choice-catalog/'}]
            },
            {
                name: 'Ссылочный', select: [
                    {argument: 'type', value: 'slider-clickable'},
                    {argument: 'path', placeholder: 'Ссылка'}]
            }
        ],
        {argument: "group", value: 'head'},
        {argument: "structurePageId", value: page}
    ]

    const [infoLabel, setInfoLabel] = useState('*Поля обязательные для заполнения')
    const [json, setJson] = useState({})
    const {createStructureCatalog} = useServer()
    const {authenticationData} = useData()

    return (<PopUpWindow title={'Создать элемент карусели'}>

        {<AP_CreateNewCatalog data={newCatalog} setResult={setJson}/>}

        <div className={style['infoLabel']}>{infoLabel}</div>
        <div className={style['buttonPlace']}>
            <div className={style['buttonAccept']} onClick={async () => {
                await createStructureCatalog(authenticationData, json)
                onReload()
                onClose();
            }}>
                <div/>
                <p>Создать</p>
            </div>

            <div className={style['buttonCancel']} onClick={() => {
                onClose();
            }}>
                <div/>
                <p>Отмена</p>
            </div>
        </div>
    </PopUpWindow>);
};

export default CreateHead;