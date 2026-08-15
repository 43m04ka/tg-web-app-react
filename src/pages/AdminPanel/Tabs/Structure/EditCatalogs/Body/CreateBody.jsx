import React, {useState, useEffect} from 'react';
import style from '../../Structure.module.scss';
import {useServer} from "../../useServer";
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
import AP_CreateNewCatalog from "../AP_CreateNewCatalog/AP_CreateNewCatalog";
import DropImage from "../../../../Elements/DropImage/DropImage";
import InputLabel from "../../../../Elements/Input/InputLabel";
import SwitchLabel from "../../../../Elements/SwitchLabel/SwitchLabel";
import useData from "../../../../useData";

const CreateBody = ({onClose, page, onReload, copyData}) => {

    const newCatalog = [{
        argument: "serialNumber",
        placeholder: 'Порядковый номер',
        type: 'number',
        defaultValue: copyData.serialNumber || '',
    }, {argument: "backgroundColor", placeholder: 'Выделение цветом', defaultValue: copyData.backgroundColor || ''}, [{
        name: 'Обычный', select: [{
            argument: 'type', value: 'ordinary'
        }, {
            argument: 'name', placeholder: 'Имя каталога',
        }, {
            argument: "path", placeholder: 'Путь до категории'
        }]
    }, {
        name: 'Каталог-выбор', select: [{
            argument: 'type', value: 'ordinary-choice'
        }, {
            argument: 'name', placeholder: 'Имя каталога'
        }, {
            argument: "path", placeholder: 'Путь до категории'
        }]
    }, {
        name: 'Скидочный', select: [{
            argument: 'type', value: 'discount'
        }, {
            argument: 'name', placeholder: 'Имя каталога'
        }, {
            argument: "path", placeholder: 'Путь до категории'
        }, {
            argument: "deleteDate", placeholder: 'Дата и время удаления'
        }]
    }, {
        name: 'Баннер', select: [{
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
        }]
    },], {argument: "group", value: 'body'}, {argument: "structurePageId", value: page}]


    const [json, setJson] = useState({})
    const [bannerUrl, setBannerUrl] = useState(copyData.url || '')
    const [iconData, setIconData] = useState(copyData.imageIcon || '')
    const [roundedTop, setRoundedTop] = useState(copyData.isRoundedBorderTop || false)
    const [roundedBottom, setRoundedBottom] = useState(copyData.isRoundedBorderBottom || false)
    const {createStructureCatalog} = useServer()
    const {authenticationData} = useData()

    const isBannerType = json.type?.includes('banner');

    console.log(json)

    return (<PopUpWindow title={Object.keys(copyData).length > 0 ? 'Копировать элемент тела' : 'Создать элемент тела'} onClose={onClose}>

        {<AP_CreateNewCatalog data={newCatalog} setResult={setJson}/>}

        {/* Для баннеров - поле ввода ссылки на изображение */}
        {isBannerType && (
            <>
                <InputLabel label={'Ссылка на изображение баннера'} defaultValue={bannerUrl}
                    onChange={(e) => {
                        setBannerUrl(e.target.value)
                        setJson({...json, url: e.target.value})
                    }} />
                {bannerUrl && (
                    <div style={{
                        maxWidth: '200px',
                        height: '100px',
                        backgroundColor: '#2a2f3a',
                        borderRadius: '4px',
                        backgroundImage: `url(${bannerUrl})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        marginTop: '10px'
                    }}></div>
                )}
            </>
        )}

        {/* Для каталогов - загрузка иконки */}
        {!isBannerType && (
            <DropImage setValue={(value) => {
                setIconData(value)
                setJson({...json, imageIcon: value})
            }} icon={iconData} label={'Иконка каталога'} />
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

export default CreateBody;
