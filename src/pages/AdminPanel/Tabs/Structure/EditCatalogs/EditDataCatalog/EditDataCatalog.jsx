import React, {useEffect} from 'react';
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
import EditDataPosition from "../../../../Blocks/EditDataPosition/EditDataPosition";
import DropImage from "../../../../Elements/DropImage/DropImage";
import InputLabel from "../../../../Elements/Input/InputLabel";
import style from "../../../EditCards/EditData/EditDataCard.module.scss";
import useData from "../../../../useData";
import {useServer} from "../../useServer";

const EditDataCatalog = ({catalogList, onClose, onReload, catalogId}) => {


    let catalog = {}
    catalogList.map((item) => {
        if(item.id === catalogId) {
            catalog = item;
        }
    })

    const [newData, setNewData] = React.useState({});
    const [imageUrl, setImageUrl] = React.useState(catalog.url || '');
    const {updateCatalogData, getCatalogIcons} = useServer();
    const {authenticationData} = useData()
    const [iconsData, setIconsData] = React.useState([]);

    useEffect(() => {
        getCatalogIcons(setIconsData).then()
    }, []);

    const isBanner = catalog.type?.includes('banner');

    // Формируем параметры динамически в зависимости от типа
    const getParameters = () => {
        const baseParams = [
            {type: 'number', defaultValue: 0, key:'serialNumber', label: 'Порядковый номер'},
            {type: 'boolean', key:'isRoundedBorderTop', label: 'Закругление сверху'},
            {type: 'boolean', key:'isRoundedBorderBottom', label: 'Закругление снизу'},
        ];

        if (catalog.group === 'head') {
            return [
                ...baseParams,
                {type: 'string', key:'path', label: 'Ссылка элемента'},
            ];
        } else if (isBanner) {
            return [
                ...baseParams,
                {type: 'string', key:'path', label: 'Ссылка элемента'},
                {type: 'color', key:'backgroundColor', label: 'Цвет фона'},
            ];
        } else {
            // Каталог
            return [
                ...baseParams,
                {type: 'string', key:'name', label: 'Имя'},
                {type: 'string', key:'path', label: 'Ссылка элемента'},
                {type: 'color', key:'backgroundColor', label: 'Цвет фона'},
            ];
        }
    };

    const parameters = getParameters();

    return (
        <PopUpWindow title={'Редактирование элемента'} onClose={onClose}>
            <EditDataPosition structure={parameters} currentData={catalog} setNewData={setNewData}/>

            {/* Для head - поле ввода ссылки на изображение */}
            {catalog.group === 'head' && (
                <>
                    <InputLabel label={'Ссылка на изображение'} defaultValue={imageUrl}
                        onChange={(e) => {
                            setImageUrl(e.target.value)
                            setNewData({...newData, url: e.target.value})
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
                </>
            )}

            {/* Для body banner - поле ввода ссылки на изображение */}
            {catalog.group === 'body' && isBanner && (
                <>
                    <InputLabel label={'Ссылка на изображение баннера'} defaultValue={imageUrl}
                        onChange={(e) => {
                            setImageUrl(e.target.value)
                            setNewData({...newData, url: e.target.value})
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
                </>
            )}

            {/* Для body каталог - загрузка иконки */}
            {catalog.group === 'body' && !isBanner && (
                <DropImage setValue={(value) => setNewData({...newData, imageIcon: value})} icon={catalog.imageIcon} label={'Иконка каталога'} />
            )}

            <div className={style['buttonPlace']}>
                <div className={style['buttonAccept']}
                     onClick={() => updateCatalogData(() => {
                         onReload()
                         onClose()
                     }, authenticationData, catalogId ,newData)}>
                    <div/>
                    <p>Сохранить</p>
                </div>
            </div>
        </PopUpWindow>
    );
};

export default EditDataCatalog;
