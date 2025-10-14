import React, {useState} from 'react';
import style from '../../Structure.module.scss';
import {useServer} from "../../useServer";
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
import AP_CreateNewCatalog from "../AP_CreateNewCatalog/AP_CreateNewCatalog";
import useData from "../../../../useData";

const CreateBody = ({onClose, page, onReload}) => {

    const newCatalog = [{
        argument: "serialNumber", placeholder: 'Порядковый номер', type: 'number'
    }, {argument: "backgroundColor", placeholder: 'Выделение цветом'}, [{
        name: 'Обычный', select: [{argument: 'type', value: 'ordinary'}, {
            argument: 'name', placeholder: 'Имя каталога'
        }, {argument: "path", placeholder: 'Путь до категории'}]
    }, {
        name: 'Каталог-выбор', select: [{argument: 'type', value: 'ordinary-choice'}, {
            argument: 'name', placeholder: 'Имя каталога'
        }, {argument: "path", placeholder: 'Путь до категории'}]
    }, {
        name: 'Скидочный', select: [{argument: 'type', value: 'discount'}, {
            argument: 'name', placeholder: 'Имя каталога'
        }, {argument: "path", placeholder: 'Путь до категории'}, {
            argument: "deleteDate", placeholder: 'Дата и время удаления'
        }]
    }, {
        name: 'Баннер', select: [{argument: "url", placeholder: 'url изображения'}, [{
            name: 'Некликабельный',
            select: [{argument: 'type', value: 'banner-non-clickable'}, {argument: "path", value: null}]
        }, {
            name: 'На карту', select: [{argument: 'type', value: 'banner-clickable'}, {
                argument: 'path', placeholder: 'id карты', tag: '/card/'
            }]
        }, {
            name: 'На каталог', select: [{argument: 'type', value: 'banner-clickable'}, {
                argument: 'path', placeholder: 'Путь до категории', tag: '/catalog/'
            }]
        }, {
            name: 'На каталог-выбор', select: [{argument: 'type', value: 'banner-clickable'}, {
                argument: 'path', placeholder: 'Путь до категории', tag: '/choice-catalog/'
            }]
        }, {
            name: 'Ссылочный',
            select: [{argument: 'type', value: 'banner-clickable'}, {argument: 'path', placeholder: 'Ссылка'}]
        }],]
    },], {argument: "group", value: 'body'}, {argument: "structurePageId", value: page}]

    const [infoLabel, setInfoLabel] = useState('*Поля обязательные для заполнения')
    const [json, setJson] = useState({})
    const {createStructureCatalog} = useServer()
    const {authenticationData} = useData()

    return (<PopUpWindow title={'Создать элемент тела'}>

        {<AP_CreateNewCatalog data={newCatalog} setResult={setJson}/>}

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

export default CreateBody;