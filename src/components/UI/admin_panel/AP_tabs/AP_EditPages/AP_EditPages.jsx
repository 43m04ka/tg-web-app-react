import React, {useRef, useState} from 'react';
import {useServer} from "../../../../../hooks/useServer";
import AP_EditCatalogs from "./AP_EditCatalogs";

const ApEditStructure = () => {

    const [pageList, setPageList] = useState(0)
    const [pageId, setPageId] = useState(0)

    const inputNameCreatePage = useRef()
    const inputLinkCreatePage = useRef()
    const inputNumberCreatePage = useRef()

    const {getPages, deletePage, createPage} = useServer()

    if (!pageList) {
        getPages(setPageList).then()
        return (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>)
    } else {
        return (
            <div>
                <div style={{display:'flex', flexDirection:'row'}}>
                    {pageList.map((page) => {
                        let elementStyle = {
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                        }

                        if (page.id === pageId) {
                            elementStyle.background = '#ef7474'
                        }

                        return (<div style={{
                            borderRadius: '10px',
                            background: '#232323',
                            marginTop: '7px',
                            marginLeft: '5px',
                            marginRight: '5px',
                            padding: '5px',
                            width: 'max-content'
                        }}>
                            <div className={'text-element'} style={{height:'37px', alignContent:'center', fontSize:'14px'}}>
                                Имя: {page.name}
                            </div>
                            <div className={'text-element'} style={{height:'37px', alignContent:'center', fontSize:'14px'}}>
                                Ссылка: {page.link}
                            </div>
                            <div className={'text-element'} style={{height:'37px', alignContent:'center', fontSize:'14px'}}>
                                Номер: {page.serialNumber}
                            </div>

                            <button onClick={async () => {
                                await setPageId(page.id)
                            }} style={elementStyle}>Редактировать
                            </button>

                            <button onClick={async () => {
                                const result = confirm("Точно хотите удалить?");
                                console.log(name)
                                if (result === true) {
                                    await deletePage(page.id)
                                    await getPages(setPageList)
                                }
                            }} style={{
                                margin: '5px',
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                            }}>Удалить
                            </button>
                        </div>)

                    })}
                    <div style={{
                        borderRadius: '10px',
                        background: '#232323',
                        marginTop: '7px',
                        marginLeft: '5px',
                        marginRight: '5px',
                        padding: '5px',
                        width: 'max-content',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <input style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}
                               ref={inputNameCreatePage} placeholder={'Имя'}/>
                        <input style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}
                               ref={inputLinkCreatePage} placeholder={'Ссылка'}/>
                        <input style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}
                               ref={inputNumberCreatePage} placeholder={'Номер'}/>

                        <button onClick={async () => {
                            await createPage(inputNameCreatePage.current.value, inputLinkCreatePage.current.value, Number(inputNumberCreatePage.current.value))
                            inputNameCreatePage.current.value = ''
                            inputLinkCreatePage.current.value = ''
                            inputNumberCreatePage.current.value = ''
                            await getPages(setPageList)
                        }} style={{
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                        }}>Создать
                        </button>
                    </div>
                </div>
                <AP_EditCatalogs page={pageId}/>
            </div>
        )
    }
};

export default ApEditStructure;


// return (            if (selectedViewCatalog === view.id) {
//                             return (<button onClick={() => {
//                                 setSelectedViewCatalog(view.id)
//                             }} style={{
//                                 margin: '5px',
//                                 borderRadius: '100px',
//                                 padding: '5px',
//                                 border: '0px',
//                                 background: '#ef7474'
//                             }}>{view.name}
//                             </button>)
//                         } else {
//                             return (<button onClick={() => {
//                                 setSelectedViewCatalog(view.id)
//                             }} style={{
//                                 margin: '5px',
//                                 borderRadius: '100px',
//                                 padding: '5px',
//                                 border: '0px',
//                             }}>{view.name}
//                             </button>)
//                         }
//                     })}
//                 </div>
//                 <input placeholder={'Порядковый_номер'} onChange={(event) => {
//                     setInputCategory1(event.target.value)
//                 }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
//
//                 <input placeholder={'Выделение_цветом'} onChange={(event) => {
//                     setInputCategory4(event.target.value)
//                 }} style={{
//                     margin: '5px',
//                     borderRadius: '100px',
//                     padding: '5px',
//                     border: '0px',
//                 }}/>
//
//                 {[0].map(a => {
//                     if (selectedViewCatalog !== 12) {
//                         return (<>
//                                 <input placeholder={'Имя_категории'} onChange={(event) => {
//                                     setInputCategory2(event.target.value)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                                 <input placeholder={'Путь_до_категории'} onChange={(event) => {
//                                     setInputCategory3(event.target.value)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                             </>
//                         )
//                     }
//                     if (selectedViewCatalog === 12) {
//                         return (
//                             <>
//                                 <input placeholder={'url_изображения'} onChange={(event) => {
//                                     setInputCategory2(event.target.value)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                                 <div>
//                                     {[{id: 0, name: 'Некликабельный'}, {id: 1, name: 'На карту'}, {
//                                         id: 2,
//                                         name: 'На каталог'
//                                     }, {id: 3, name: 'Ссылочный'}].map(view => {
//                                         if (selectedViewCatalog1 === view.id) {
//                                             return (<button onClick={() => {
//                                                 setSelectedViewCatalog1(view.id)
//                                             }} style={{
//                                                 margin: '5px',
//                                                 borderRadius: '100px',
//                                                 padding: '5px',
//                                                 border: '0px',
//                                                 background: '#ef7474'
//                                             }}>{view.name}
//                                             </button>)
//                                         } else {
//                                             return (<button onClick={() => {
//                                                 setSelectedViewCatalog1(view.id)
//                                             }} style={{
//                                                 margin: '5px',
//                                                 borderRadius: '100px',
//                                                 padding: '5px',
//                                                 border: '0px',
//                                             }}>{view.name}
//                                             </button>)
//                                         }
//                                     })}
//                                 </div>
//                             </>
//                         )
//                     }
//                 })}
//                 {[{id: 0, name: 'Некликабельный'}, {id: 1, name: 'На карту'}, {
//                     id: 2,
//                     name: 'На каталог'
//                 }, {id: 3, name: 'Ссылочный'}].map(view => {
//                     if (selectedViewCatalog === 12) {
//                         if (selectedViewCatalog1 === 0 && selectedViewCatalog1 === view.id) {
//                             if (inputCategory3 !== '') {
//                                 setInputCategory3('')
//                             }
//                         }
//                         if (selectedViewCatalog1 === 1 && selectedViewCatalog1 === view.id) {
//                             return (<input placeholder={'id-карты'} onChange={(event) => {
//                                 setInputCategory3('/card/' + event.target.value)
//                             }} style={{
//                                 margin: '5px',
//                                 borderRadius: '100px',
//                                 padding: '5px',
//                                 border: '0px',
//                             }}/>)
//                         }
//                         if (selectedViewCatalog1 === 2 && selectedViewCatalog1 === view.id) {
//                             return (<input placeholder={'Путь до каталога'} onChange={(event) => {
//                                 setInputCategory3('/home/' + event.target.value)
//                             }} style={{
//                                 margin: '5px',
//                                 borderRadius: '100px',
//                                 padding: '5px',
//                                 border: '0px',
//                             }}/>)
//                         }
//                         if (selectedViewCatalog1 === 3 && selectedViewCatalog1 === view.id) {
//                             return (<input placeholder={'Ссылка'} onChange={(event) => {
//                                 setInputCategory3(event.target.value)
//                             }} style={{
//                                 margin: '5px',
//                                 borderRadius: '100px',
//                                 padding: '5px',
//                                 border: '0px',
//                             }}/>)
//                         }
//                     }
//                 })}
//
//                 {[{id: 10, name: 'Обычный'}, {id: 11, name: 'Скидочный'}, {
//                     id: 12,
//                     name: 'Баннер'
//                 }].map(view => {
//                     if (selectedViewCatalog === 11 && selectedViewCatalog === view.id) {
//                         return (
//                             <div>
//                                 <input placeholder={'Месяц {03}*'} onChange={(event) => {
//                                     let newArray = inputCategory5
//                                     newArray[0] = event.target.value
//                                     setInputCategory5(newArray)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                                 <input placeholder={'День {23}*'} onChange={(event) => {
//                                     let newArray = inputCategory5
//                                     newArray[1] = event.target.value
//                                     setInputCategory5(newArray)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                                 <input placeholder={'Год {2025}*'} onChange={(event) => {
//                                     let newArray = inputCategory5
//                                     newArray[2] = event.target.value
//                                     setInputCategory5(newArray)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                                 <input placeholder={'Час {12}'} onChange={(event) => {
//                                     let newArray = inputCategory5
//                                     newArray[3] = event.target.value
//                                     setInputCategory5(newArray)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                                 <input placeholder={'Минута {00}'} onChange={(event) => {
//                                     let newArray = inputCategory5
//                                     newArray[4] = event.target.value
//                                     setInputCategory5(newArray)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                                 <input placeholder={'Секунда {00}'} onChange={(event) => {
//                                     let newArray = inputCategory5
//                                     newArray[5] = event.target.value
//                                     setInputCategory5(newArray)
//                                 }} style={{
//                                     margin: '5px',
//                                     borderRadius: '100px',
//                                     padding: '5px',
//                                     border: '0px',
//                                 }}/>
//                             </div>)
//                     }
//                 })}
//                 <button onClick={() => {
//                     addCategory(1, dataStructure[page].id)
//                 }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Добавить
//                     категорию
//                 </button>
//             </div>
//         </div>
//     </div>
//
// </div>)