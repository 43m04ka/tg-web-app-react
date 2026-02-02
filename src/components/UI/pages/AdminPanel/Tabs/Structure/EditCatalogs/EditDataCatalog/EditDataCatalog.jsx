import React, {useEffect} from 'react';
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
import EditDataPosition from "../../../../Blocks/EditDataPosition/EditDataPosition";
import style from "../../../EditCards/EditData/EditDataCard.module.scss";
import useData from "../../../../useData";
import {useServer} from "../../../../useServer";

const EditDataCatalog = ({catalogList, onClose, onReload, catalogId}) => {


    let catalog = {}
    catalogList.map((item) => {
        if(item.id === catalogId) {
            catalog = item;
        }
    })

    const [newData, setNewData] = React.useState({});
    const {updateCatalogData, getCatalogIcons} = useServer();
    const {authenticationData} = useData()
    const [iconsData, setIconsData] = React.useState([]);

    useEffect(() => {
        getCatalogIcons(setIconsData).then()
    }, []);


    const parameters = [
        {type: 'string', key:'name', label: 'Имя'},
        {type: 'string', key:'url', label: 'Ссылка на изображение'},
        {type: 'string', key:'backgroundColor', label: 'Цвет фона'},
        {type: 'string', key:'path', label: 'Ссылка элемента'},
        {type: 'dropbox', key:'imageIcon', label: 'Иконкка каталога', data: [{label:'Без иконки', value: null},...iconsData]},
        {type: 'number', defaultValue: 0, key:'serialNumber', label: 'Порядковый номер'},
        {type: 'boolean', key:'isRoundedBorderTop', label: 'Закругление сверху'},
        {type: 'boolean', key:'isRoundedBorderBottom', label: 'Закругление снизу'},
    ]

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