import React, {useEffect, useRef, useState} from 'react';
import {useServer} from "../../../../hooks/useServer";

const ApEditCards = () => {

    const {getSearch, deleteCards, changeStatusCards, editCardPrice, getPages} = useServer()

    const [tabId, setTabId] = useState(0)
    const [cardList, setCardList] = useState([])
    const [selectCardId, setSelectCardId] = useState(-1)
    const [pageList, setPageList] = useState([])

    const searchInput = useRef();

    useEffect(() => {
        getPages(setPageList).then()
    }, [])


    return (
        <div>
            <div>
                   <div style={{display: 'flex', flexDirection: 'row', padding: '10px'}}>
                       {pageList.map((tab, index) => {
                            if (index === tabId) {
                                return (<button onClick={() => {
                                    setTabId(index)
                                }} style={{
                                    margin: '5px',
                                    borderRadius: '100px',
                                    padding: '5px',
                                    border: '0px',
                                    background: '#ef7474'
                                }}>{tab.name}
                                </button>)
                            } else {
                                return (<button onClick={() => {
                                    setTabId(index)
                                }} style={{
                                    margin: '5px',
                                    borderRadius: '100px',
                                    padding: '5px',
                                    border: '0px',
                                }}>{tab.name}
                                </button>)
                            }
                        })}
                        <input placeholder={'Поиск карты по имени'} ref={searchInput} style={{
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                            width: '300px'
                        }}/>
                        <button onClick={async () => {
                            await getSearch(searchInput.current.value, tabId, setCardList)
                        }} style={{
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                        }}>Поиск
                        </button>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', padding: '10px'}}>
                        {cardList.map(card => {
                                let colorButtonStatus, textColorButtonStatus, textButtonStatus

                                if (card.body.isSale) {
                                    textButtonStatus = 'Убрать с продажи'
                                    colorButtonStatus = 'white'
                                    textColorButtonStatus = 'black'
                                } else {
                                    textButtonStatus = 'Включить в продажу'
                                    colorButtonStatus = '#ef7474'
                                    textColorButtonStatus = 'white'
                                }

                                let height = 0
                                let textButton = 'Изменить цену'
                                let buttonColor = 'black'
                                let buttonBackground = 'white'
                                if (selectCardId === card.id) {
                                    height = card.category.length * 30 + 60
                                    textButton = 'Скрыть поле поле'
                                    buttonBackground = '#ef7474'
                                    buttonColor = 'white'
                                }
                                let newPriceArr = card.price

                                let oldPriceValue = null

                                if (typeof card.body.endDate !== 'undefined') {
                                    oldPriceValue = card.body.oldPrice
                                }

                                let oldPriceEditElement = (<div style={{height: '25px'}}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            height: '25px',
                                            marginTop: '5px',
                                            width: 'max-content'
                                        }}>
                                            <div className={'text-element'} style={{
                                                marginLeft: '0px',
                                                background: '#131313',
                                                lineHeight: '15px',
                                                padding: '5px',
                                                borderRadius: '100px',
                                            }}>
                                                <div style={{
                                                    marginLeft: '5px',
                                                    marginRight: '5px',
                                                    height: '15px',
                                                    overflow: 'hidden'
                                                }}>
                                                    {card.category.length + 1 + ' - Старая цена'}
                                                </div>
                                            </div>
                                            <div className={'text-element'} style={{
                                                marginLeft: '0px',
                                                background: '#131313',
                                                lineHeight: '15px',
                                                borderRadius: '100px',
                                            }}>
                                                <div style={{
                                                    marginLeft: '5px',
                                                    height: '25px',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                }}>
                                                    <div style={{marginRight: '3px', marginTop: '5px',}}>
                                                        Цена:
                                                    </div>
                                                    <input defaultValue={oldPriceValue}
                                                           onChange={(event) => {
                                                               oldPriceValue = parseInt(event.target.value)
                                                           }} style={{
                                                        borderRadius: '100px',
                                                        border: '0px',
                                                        paddingLeft: '5px'
                                                    }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )

                                return (
                                    <div style={{
                                        borderBottom: '1px solid grey',
                                        paddingBottom: '5px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            paddingTop: '5px',
                                        }}>
                                            <img src={card.body.img} alt={card.body.title} style={{
                                                height: '85px',
                                                width: '85px',
                                                backgroundSize: 'cover',
                                                borderRadius: '10px'
                                            }}/>
                                            <div style={{display: 'flex', flexDirection: 'column'}}
                                                 className={'text-element text-basket'}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    height: '25px',
                                                }}>
                                                    <div style={{
                                                        background: '#131313',
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {'Имя: ' + card.body.title}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    height: '25px',
                                                    marginTop: '5px',
                                                    width: 'max-content'
                                                }}>
                                                    <div style={{
                                                        background: '#131313',
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {'Цена: ' + card.body.price}
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        marginLeft: '5px',
                                                        background: '#131313',
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {'Платформа: ' + card.body.platform}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        background: '#131313',
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {'Каталоги: ' + String(card.category)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    height: '25px',
                                                    marginTop: '5px',
                                                    width: 'max-content'
                                                }}>
                                                    <div style={{
                                                        background: '#131313',
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {'Id: ' + card.id}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        background: colorButtonStatus,
                                                        color: textColorButtonStatus,
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }} onClick={async () => {
                                                            await changeStatusCards(card.category[0], [card.id])
                                                            await getSearch(searchInput.current.value, tabId, setCardList)
                                                        }}>
                                                            {textButtonStatus}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        background: buttonBackground,
                                                        color: buttonColor,
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }} onClick={async () => {
                                                            if (card.id !== selectCardId) {
                                                                setSelectCardId(card.id)
                                                            } else {
                                                                setSelectCardId(-1)
                                                            }
                                                        }}>
                                                            {textButton}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        background: 'white',
                                                        color: 'black',
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }} onClick={async () => {
                                                            if (card.category.length > 1) {
                                                                const name = prompt("Введите путь категории(ничего не вводить для удаления из всех)");
                                                                await deleteCards(name, [card.id])
                                                                await getSearch(searchInput.current.value, tabId, setCardList)
                                                            } else {
                                                                const result = confirm("Точно хотите удалить?");
                                                                console.log(name)
                                                                if (result === true) {
                                                                    await deleteCards(card.category[0], [card.id])
                                                                    await getSearch(searchInput.current.value, tabId, setCardList)
                                                                }
                                                            }

                                                        }}>
                                                            Удалить
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{height: String(height) + 'px', overflow: 'hidden'}}>
                                            {card.category.map(categoryCard => {
                                                let index = card.category.indexOf(categoryCard)
                                                return (<div style={{height: '25px'}}>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        height: '25px',
                                                        marginTop: '5px',
                                                        width: 'max-content'
                                                    }}>
                                                        <div className={'text-element'} style={{
                                                            marginLeft: '0px',
                                                            background: '#131313',
                                                            lineHeight: '15px',
                                                            padding: '5px',
                                                            borderRadius: '100px',
                                                        }}>
                                                            <div style={{
                                                                marginLeft: '5px',
                                                                marginRight: '5px',
                                                                height: '15px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {index + 1 + ' - Каталог: ' + categoryCard}
                                                            </div>
                                                        </div>
                                                        <div className={'text-element'} style={{
                                                            marginLeft: '0px',
                                                            background: '#131313',
                                                            lineHeight: '15px',
                                                            borderRadius: '100px',
                                                        }}>
                                                            <div style={{
                                                                marginLeft: '5px',
                                                                height: '25px',
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                            }}>
                                                                <div
                                                                    style={{marginRight: '3px', marginTop: '5px',}}>
                                                                    Цена:
                                                                </div>
                                                                <input defaultValue={newPriceArr[index]}
                                                                       onChange={(event) => {
                                                                           newPriceArr[index] = parseInt(event.target.value)
                                                                       }} style={{
                                                                    borderRadius: '100px',
                                                                    border: '0px',
                                                                    paddingLeft: '5px'
                                                                }}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>)
                                            })}
                                            {oldPriceEditElement}
                                            <div style={{
                                                marginLeft: '5px',
                                                marginTop: '5px',
                                                background: 'white',
                                                color: 'black',
                                                lineHeight: '15px',
                                                padding: '5px',
                                                borderRadius: '100px',
                                                width: 'max-content',
                                            }}>
                                                <div className={'text-element'} style={{
                                                    marginLeft: '5px',
                                                    marginRight: '5px',
                                                    height: '15px',
                                                    width: 'max-content',
                                                    color: 'black'
                                                }} onClick={async () => {
                                                    let oldPrice = ''
                                                    if (oldPriceValue !== null && oldPriceValue !== '') {
                                                        oldPrice = oldPriceValue
                                                    }
                                                    await editCardPrice(card.id, newPriceArr, oldPrice)
                                                    await getSearch(searchInput.current.value, tabId, setCardList)
                                                    setSelectCardId(-1)
                                                }}>
                                                    Сохранить
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
        </div>
    );
};

export default ApEditCards;