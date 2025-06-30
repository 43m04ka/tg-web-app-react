import React, {useState} from 'react';
import {useServer} from "../../../../../hooks/useServer";
import AP_CardList from "./AP_CardList";

const ApEditDirectories = () => {
    const {getCategories, deleteCards, changeStatusCards} = useServer();

    const [dataCategory, setDataCategory] = React.useState(0)
    const [selectedPath, setSelectedPath] = useState(-1);


    const onReload = () =>{
        getCategories(setDataCategory).then()
    }

    if (dataCategory.length === 0) {
        return (<div>
            Нет загруженных каталогов
        </div>)
    } else if (dataCategory === 0) {
        getCategories(setDataCategory).then()
        return (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>)
    } else {
        return (
            <div>
                {dataCategory.map(category => {
                    let text
                    let styleButton
                    if (category.isSale) {
                        text = 'Убрать с продажи'
                        styleButton = {
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                        }
                    } else {
                        text = 'Включить в продажу'
                        styleButton = {
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                            background: '#ef7474',
                            color: 'white'
                        }
                    }

                    let text1
                    let styleButton1
                    let cardList = (<></>)

                    if (category.path === selectedPath) {
                        text1 = 'Скрыть список карт'
                        styleButton1 = {
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                            background: '#ef7474',
                            color: 'white'
                        }
                        cardList = (<AP_CardList path={category.path} onReload={onReload}/>)
                    } else {
                        text1 = 'Раскрыть список карт'
                        styleButton1 = {
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                        }
                    }

                    return (
                        <div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '600px 200px 200px 100px',
                                borderBottom: '1px solid gray',
                                alignItems: 'center',
                                justifyContent: 'left'
                            }}>
                                <div className={'title'}>{category.path}</div>
                                <button onClick={async () => {
                                    await changeStatusCards(category.path, 'all')
                                    await getCategories(setDataCategory)
                                    await setSelectedPath(-1)
                                }} style={styleButton}>{text}
                                </button>

                                <button onClick={async () => {
                                    if (category.path === selectedPath) {
                                        setSelectedPath(-1)
                                    } else {
                                        setSelectedPath(category.path)
                                    }
                                }} style={styleButton1}>{text1}
                                </button>

                                <button onClick={async () => {
                                    await deleteCards(category.path, 'all')
                                    await getCategories(setDataCategory)
                                }} style={{
                                    margin: '5px',
                                    borderRadius: '100px',
                                    padding: '5px',
                                    border: '0px',
                                }}>Удалить
                                </button>
                            </div>
                            {cardList}
                        </div>
                    )
                })}
            </div>
        );
    };
}

export default ApEditDirectories;