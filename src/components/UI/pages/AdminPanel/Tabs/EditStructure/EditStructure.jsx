import React, {useRef, useState} from 'react';
import AP_CreateNewCatalog from "./AP_CreateNewCatalog/AP_CreateNewCatalog";
import {useServer} from "../../useServer";
import DropLabel from "../../Elements/DropLabel";
import useGlobalData from "../../../../../../hooks/useGlobalData";
import BlockLabel from "../../Elements/BlockLabel";
import useData from "../../useData";


let currentPage = 0
const EditStructure = () => {

    const [catalogHeadList, setCatalogHeadList] = useState([])
    const [catalogBodyList, setCatalogBodyList] = useState([])
    const [page, setPage] = useState(-1)

    const {getStructureCatalogList, deleteStructureCatalog} = useServer()
    const {pageList} = useGlobalData()
    const {authenticationData} = useData()


    const newSlider = [
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
                    {argument: 'path', placeholder: 'Путь до категории', tag: '/home/'}]
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

    const newCatalog = [
        {argument: "serialNumber", placeholder: 'Порядковый номер', type: 'number'},
        {argument: "backgroundColor", placeholder: 'Выделение цветом'},
        [
            {
                name: 'Обычный', select: [
                    {argument: 'type', value: 'ordinary'},
                    {argument: 'name', placeholder: 'Имя каталога'},
                    {argument: "path", placeholder: 'Путь до категории'}]
            },
            {
                name: 'Каталог-выбор', select: [
                    {argument: 'type', value: 'ordinary-choice'},
                    {argument: 'name', placeholder: 'Имя каталога'},
                    {argument: "path", placeholder: 'Путь до категории'}]
            },
            {
                name: 'Скидочный', select: [
                    {argument: 'type', value: 'discount'},
                    {argument: 'name', placeholder: 'Имя каталога'},
                    {argument: "path", placeholder: 'Путь до категории'},
                    {argument: "deleteDate", placeholder: 'Дата и время удаления'}]
            },
            {
                name: 'Баннер', select: [
                    {argument: "url", placeholder: 'url изображения'},
                    [
                        {
                            name: 'Некликабельный', select: [
                                {argument: 'type', value: 'banner-non-clickable'},
                                {argument: "path", value: null}]
                        },
                        {
                            name: 'На карту', select: [
                                {argument: 'type', value: 'banner-clickable'},
                                {argument: 'path', placeholder: 'id карты', tag: '/card/'}]
                        },
                        {
                            name: 'На каталог', select: [
                                {argument: 'type', value: 'banner-clickable'},
                                {argument: 'path', placeholder: 'Путь до категории', tag: '/home/'}]
                        },
                        {
                            name: 'На каталог-выбор', select: [
                                {argument: 'type', value: 'banner-clickable'},
                                {argument: 'path', placeholder: 'Путь до категории', tag: '/choice-catalog/'}]
                        },
                        {
                            name: 'Ссылочный', select: [
                                {argument: 'type', value: 'banner-clickable'},
                                {argument: 'path', placeholder: 'Ссылка'}]
                        }
                    ],]
            },
        ],
        {argument: "group", value: 'body'},
        {argument: "structurePageId", value: page}
    ]

    const reload = async () => {
        currentPage = page
        await getStructureCatalogList(page, 'head', setCatalogHeadList).then()
        await getStructureCatalogList(page, 'body', setCatalogBodyList).then()
    }


    if (currentPage !== page) {
        reload()
    }
    return (
        <div>
            <div>
                <BlockLabel label={'Выбор страницы'}>
                    <DropLabel label={pageList.map(page => {
                        page.label = page.name;
                        return page
                    })} onChange={(result) => setPage(pageList[result].id)}/>
                </BlockLabel>
            </div>
            {page > 0 ?
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
                    <div style={{marginTop: '5px', margin: '7px'}}>
                        <div className={'title'}
                             style={{color: 'white', marginLeft: '10px'}}>Слайдер
                        </div>
                        {catalogHeadList.map(category => {
                            let propertyElement = []
                            if (category.type !== 'slider-non-clickable') {
                                propertyElement.push({argument: 'Путь: ', value: category.path})
                            }
                            propertyElement.push({argument: 'Изображение: ', value: category.url})
                            propertyElement.push({argument: 'Номер: ', value: category.serialNumber})

                            return (
                                <div style={{
                                    borderRadius: '10px',
                                    background: '#232323',
                                    marginTop: '7px',
                                    marginLeft: '5px',
                                    marginRight: '5px',
                                    padding: '5px'
                                }} key={category.id}>
                                    {propertyElement.map(property => (
                                        <div className={'text-element'}
                                             style={property.style || {}}>{property.argument + property.value}</div>))}
                                    <button style={{
                                        margin: '5px',
                                        borderRadius: '100px',
                                        padding: '5px',
                                        border: '0px',
                                    }}
                                            onClick={async () => {
                                                await deleteStructureCatalog(authenticationData, category.id)
                                                await getStructureCatalogList(page, 'head', setCatalogHeadList)
                                            }}>Удалить баннер
                                    </button>
                                </div>
                            )
                        })}
                        <AP_CreateNewCatalog data={newSlider} reload={reload}/>
                    </div>

                    <div style={{marginTop: '7px', margin: '10px'}}>
                        <div className={'title'}
                             style={{color: 'white', marginLeft: '10px'}}>Тело
                        </div>
                        {catalogBodyList.map(category => {
                            let propertyElement = []

                            if (category.type.includes('banner')) {
                                propertyElement.push({
                                    argument: 'Баннер',
                                    style: {margin: '3px', color: '#25d585'},
                                    value: ''
                                })
                                propertyElement.push({argument: 'Изображение: ', value: category.url})
                            } else if (category.type === 'discount') {
                                propertyElement.push({
                                    argument: 'Скидочный',
                                    style: {margin: '3px', color: '#d52548'},
                                    value: ''
                                })
                                propertyElement.push({argument: 'Дата удаления: ', value: category.deleteDate})
                            } else if (category.type === 'ordinary') {
                                propertyElement.push({argument: 'Обычный', style: {margin: '3px'}, value: ''})
                                propertyElement.push({argument: 'Имя: ', value: category.name})
                            } else if (category.type === 'ordinary-choice') {
                                propertyElement.push({argument: 'Каталог-выбор', style: {margin: '3px'}, value: ''})
                                propertyElement.push({argument: 'Имя: ', value: category.name})
                            }
                            if (category.type !== 'banner-non-clickable') {
                                propertyElement.push({argument: 'Путь: ', value: category.path})
                            }
                            if (typeof category.backgroundColor !== 'undefined' && category.backgroundColor !== null) {
                                propertyElement.push({
                                    argument: 'Цвет фона: ',
                                    style: {color: category.backgroundColor},
                                    value: category.backgroundColor
                                })
                            }
                            propertyElement.push({argument: 'Номер: ', value: category.serialNumber})


                            return (
                                <div style={{
                                    borderRadius: '10px',
                                    background: '#232323',
                                    marginTop: '7px',
                                    marginLeft: '5px',
                                    marginRight: '5px',
                                    padding: '5px'
                                }} key={category.id}>
                                    {propertyElement.map(property => (
                                        <div className={'text-element'}
                                             style={property.style || {}}>{property.argument + property.value}</div>))}
                                    <button style={{
                                        margin: '5px',
                                        borderRadius: '100px',
                                        padding: '5px',
                                        border: '0px',
                                    }}
                                            onClick={async () => {
                                                await deleteStructureCatalog(authenticationData, category.id)
                                                await getStructureCatalogList(page, 'body', setCatalogBodyList)
                                            }}>Удалить елемент
                                    </button>
                                </div>
                            )
                        })}
                        <AP_CreateNewCatalog data={newCatalog} reload={reload}/>
                    </div>
                </div>
                : ''}
        </div>
    );
};

export default EditStructure;

// <
//
// </div>