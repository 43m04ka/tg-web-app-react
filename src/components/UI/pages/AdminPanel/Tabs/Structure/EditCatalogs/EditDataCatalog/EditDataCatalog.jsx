import React from 'react';
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
import EditDataPosition from "../../../../Blocks/EditDataPosition/EditDataPosition";
import style from "../../../EditCards/EditData/EditDataCard.module.scss";
import useData from "../../../../useData";
import {useServer} from "../../../../useServer";

const parameters = [
    {type: 'string', key:'name', label: 'Имя'},
    {type: 'string', key:'url', label: 'Ссылка на изображение'},
    {type: 'string', key:'backgroundColor', label: 'Цвет фона'},
    {type: 'string', key:'path', label: 'Ссылка элемента'},
    {type: 'number', defaultValue: 0, key:'serialNumber', label: 'Порядковый номер'},
]

const EditDataCatalog = ({catalogList, onClose, onReload, catalogId}) => {


    let catalog = {}
    catalogList.map((item) => {
        if(item.id === catalogId) {
            catalog = item;
        }
    })

    const [newData, setNewData] = React.useState({});
    const {updateCatalogData} = useServer();
    const {authenticationData} = useData()

    return (
        <PopUpWindow title={'Редактирование каталога'}>
            <EditDataPosition structure={parameters} currentData={catalog} setNewData={setNewData}/>
            <div className={style['buttonPlace']}>
                <div className={style['buttonAccept']}
                     onClick={() => updateCatalogData(() => {
                         onReload()
                         onClose()
                     }, authenticationData, catalogId ,newData)}>
                    <div/>
                    <p>Сохранить</p>
                </div>

                <div className={style['buttonCancel']}
                     onClick={() => onClose()}>
                    <div/>
                    <p>Отмена</p>
                </div>
            </div>
        </PopUpWindow>
    );
};

export default EditDataCatalog;