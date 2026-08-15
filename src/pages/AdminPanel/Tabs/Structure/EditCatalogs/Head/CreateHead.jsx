import React, {useState} from 'react';
import style from '../../Structure.module.scss';
import {useServer} from "../../useServer";
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
import AP_CreateNewCatalog from "../AP_CreateNewCatalog/AP_CreateNewCatalog";
import InputLabel from "../../../../Elements/Input/InputLabel";
import SwitchLabel from "../../../../Elements/SwitchLabel/SwitchLabel";
import useData from "../../../../useData";

const CreateHead = ({onClose, page, onReload, copyData = {}}) => {

    const newCatalog = [
        {argument: "serialNumber", placeholder: 'Порядковый номер', type: 'number', defaultValue: copyData.serialNumber || ''},
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


    const [json, setJson] = useState({})
    const [imageUrl, setImageUrl] = useState(copyData.url || '')
    const [roundedTop, setRoundedTop] = useState(copyData.isRoundedBorderTop || false)
    const [roundedBottom, setRoundedBottom] = useState(copyData.isRoundedBorderBottom || false)
    const {createStructureCatalog} = useServer()
    const {authenticationData} = useData()

    return (<PopUpWindow title={Object.keys(copyData).length > 0 ? 'Копировать элемент карусели' : 'Создать элемент карусели'} onClose={onClose}>

        {<AP_CreateNewCatalog data={newCatalog} setResult={setJson}/>}

        <InputLabel label={'Ссылка на изображение'} defaultValue={imageUrl}
            onChange={(e) => {
                setImageUrl(e.target.value)
                setJson({...json, url: e.target.value})
            }} />

        {imageUrl && (
            <div style={{
                maxWidth: '200px',
                height: '100px',
                backgroundColor: '#2a2f3a',
                borderRadius: '4px',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                marginTop: '10px'
            }}></div>
        )}

        <SwitchLabel label={'Закругление сверху'} defaultValue={roundedTop}
            onChange={(e) => {
                setRoundedTop(e.checked)
                setJson({...json, isRoundedBorderTop: e.checked ? 1 : 0})
            }} />
        <SwitchLabel label={'Закругление снизу'} defaultValue={roundedBottom}
            onChange={(e) => {
                setRoundedBottom(e.checked)
                setJson({...json, isRoundedBorderBottom: e.checked ? 1 : 0})
            }} />

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
