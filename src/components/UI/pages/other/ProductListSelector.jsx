import React, {useCallback, useEffect} from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import {useServer} from "../../../../hooks/useServer";
import mainPage from "../../MainPage";
import useGlobalData from "../../../../hooks/useGlobalData";
import {useServerUser} from "../../../../hooks/useServerUser";

const ProductListSelector = () => {
    const [selectChoiceColumn, setSelectChoiceColumn] = React.useState(0);
    const [selectChoiceRow, setSelectChoiceRow] = React.useState(0);
    const [isImgHidden, setIsImgHidden] = React.useState(true);
    const [isBuy, setIsBuy] = React.useState(false);
    const [buttonText, setButtonText] = React.useState('Добавить в корзину');
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [cardList, setCardList] = React.useState([]);
    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const {findCardsByCatalog} = useServer()
    const {addCardToBasket} = useServerUser()
    const {catalogList, pageId, previewBasketData: basketData, updatePreviewBasketData} = useGlobalData()

    useEffect(() => {
        let catalogId = 0
        catalogList.map(el => {
            if (el.path === window.location.pathname.replace('/choice-catalog/', '')) catalogId = el.id
        })
        findCardsByCatalog(catalogId, setCardList).then()
    }, [catalogList])

    const onBack = useCallback(async () => {
        navigate(-1);
    }, [])

    const onBasket = useCallback(async () => {
        navigate('/basket-' + pageId);

    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    useEffect(() => {
        tg.BackButton.show();
    }, [])

    if (cardList.length > 0) {

        let dataOld = cardList.sort((a, b) => b.serialNumber - a.serialNumber);

        let data = []
        let index = 0

        cardList.map(card => {
            let group = data.filter(el => el.name === card.choiceColumn)
            if (group.length > 0) {
                data[group[0].id].body.push(card)
            } else {
                data.push({id:index, name:card.choiceColumn, body:[card]})
                index += 1
            }
        })

        let count = 0
        data.map(el => {
            data[count].body = el.body.sort(function (a, b) {
                try {
                    if (Number(a.choiceRow.split(' ')[0]) > Number(b.choiceRow.split(' ')[0])) {
                        return 1;
                    }
                    if (Number(a.choiceRow.split(' ')[0]) < Number(b.choiceRow.split(' ')[0])) {
                        return -1;
                    }
                } catch (e) {
                }
                try {
                    if (Number(a.choiceRow) > Number(b.choiceRow)) {
                        return 1;
                    }
                    if (Number(a.choiceRow) < Number(b.choiceRow)) {
                        return -1;
                    }
                } catch (e) {
                }
            })
            count++
        })

        count = 0
        data.map(cat => {
            cat.body.map(el => {
                el.localId = count
                count++
            })
        })

        let cordchoiceColumn = (window.innerWidth - 20 - 2 - 2) / data.length * selectChoiceColumn + 1.5
        let cordchoiceRow = (window.innerWidth - 20 - 2 - 2) / data[selectChoiceColumn].body.length * selectChoiceRow + 1.5

        let url = data[selectChoiceColumn].body[selectChoiceRow].image

        let thisElement = data[selectChoiceColumn].body[selectChoiceRow]

        let flag = false
        basketData.map(pos => {
            if (pos === thisElement.id) {
                flag = true
            }
        })

        if (isBuy !== flag && thisElement?.onSale) {
            setIsBuy(flag);
            if (flag) {
                setButtonText('Перейти в корзину');
            } else {
                setButtonText('Добавить в корзину')
            }
        }

        if (!thisElement?.onSale && isBuy !== null) {
            setIsBuy(null)
            setButtonText('Нет в продаже')
        }

        let heightImg = window.innerWidth - 20
        if (isImgHidden) {
            heightImg = heightImg * 0.75
        }

        const resizeImg = () => {
            if (isImgHidden) {
                setIsImgHidden(false)
            } else {
                setIsImgHidden(true)
            }
        }

        let buttonColor = '#51a456'
        let buttonLink = () => {
            addCardToBasket(()=>{updatePreviewBasketData(user.id)}, user.id, thisElement.id);
            setButtonText('Ожидайте...');
        }
        if (isBuy) {
            buttonColor = '#414BE0FF'
            buttonLink = () => {
                onBasket()
            }
        }

        if (!thisElement?.onSale) {
            buttonColor = '#8e8f9e'
            buttonLink = () => {
            }
        }

        let scrollerchoiceRow = (<>
            <div style={{
                display: 'grid',
                alignItems: 'center',
                width: String(window.innerWidth - 20) + 'px',
                border: '1px gray solid',
                borderRadius: '10px',
            }}>
                <div style={{
                    background: '#414BE0FF',
                    width: String(((window.innerWidth - 20 - 2 - 2) - (data[selectChoiceColumn].body.length - 1) * 2) / data[selectChoiceColumn].body.length) + 'px',
                    height: '95px',
                    borderRadius: '7px',
                    marginTop: '2px',
                    marginBottom: '2px',
                    marginRight: '2px',
                    position: 'relative',
                    marginLeft: String(cordchoiceRow) + 'px',
                    transitionProperty: 'margin-left',
                    transitionDuration: '0.2s',
                }}></div>
                {data[selectChoiceColumn].body.map(el => {
                    return (
                        <div key={el.localId} style={{
                            position: 'absolute',
                            marginLeft: String(((el.localId) % data[selectChoiceColumn].body.length) * (window.innerWidth - 20) / data[selectChoiceColumn].body.length + 'px'),
                            width: String((window.innerWidth - 30) / data[selectChoiceColumn].body.length) + 'px',
                            height: '100px'
                        }}>
                            <div style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '95px',
                                overflow: 'hidden',
                                width: String((window.innerWidth - 30) / data[selectChoiceColumn].body.length) + 'px',
                            }} onClick={() => {
                                setSelectChoiceRow(((el.localId) % data[selectChoiceColumn].body.length))
                            }}>
                                <div style={{
                                    color: 'white',
                                    height: '70px',
                                    display: 'grid',
                                    gridTemplateRows: '1fr 1fr',
                                    justifyItems: 'center',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontFamily: "'Montserrat', sans-serif"
                                    }}>{el.choiceRow}</div>
                                    <div style={{
                                        fontSize: '22px',
                                        fontFamily: "'Montserrat', sans-serif"
                                    }}>{el.price + ' ₽'}</div>
                                </div>
                            </div>
                        </div>
                    )
                })}

            </div>
        </>)

        if (data[0].body.length > 3) {
            let cordchoiceRow = selectChoiceRow * ((window.innerWidth - 20) / 3) - scrollLeft
            const windowWidth = window.innerWidth
            scrollerchoiceRow = (<div style={{overflowX: 'hidden'}}>
                <div style={{
                    display: 'grid',
                    alignItems: 'center',
                    width: String(((window.innerWidth - 20))) + 'px',
                    border: '1px gray solid',
                    borderRadius: '10px',

                }}>
                    <div style={{
                        background: '#414BE0FF',
                        width: String(((window.innerWidth - 20) / 3 + 2)) + 'px',
                        height: '95px',
                        borderRadius: '7px',
                        marginTop: '2px',
                        marginBottom: '2px',
                        marginRight: '2px',
                        position: 'relative',
                        marginLeft: String(cordchoiceRow) + 'px',
                    }}></div>
                    <div style={{
                        width: String(window.innerWidth - 20) + 'px',
                        overflowX: "scroll",
                        position: "absolute",
                        height: '100px',
                        display: 'flex'
                    }}
                         onScroll={(event) => {
                             setScrollLeft(event.target.scrollLeft)
                         }}>
                        {data[selectChoiceColumn].body.map(el => (
                            <div key={data[selectChoiceColumn].body.indexOf(el)} style={{
                                width: String(((window.innerWidth - 20) / 3)) + 'px',
                                height: '70px'
                            }}>
                                <div style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    display: 'flex',
                                    height: '95px',
                                    overflow: 'hidden',
                                    width: ((window.innerWidth - 20) / 3) + 'px',
                                }} onClick={() => {
                                    setSelectChoiceRow((data[selectChoiceColumn].body.indexOf(el) % data[selectChoiceColumn].body.length))
                                }}>
                                    <div style={{
                                        color: 'white',
                                        height: '70px',
                                        display: 'grid',
                                        gridTemplateRows: '1fr 1fr',
                                        justifyItems: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontFamily: "'Montserrat', sans-serif"
                                        }}>{el.choiceRow}</div>
                                        <div style={{
                                            fontSize: '22px',
                                            fontFamily: "'Montserrat', sans-serif"
                                        }}>{el.price + ' ₽'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}</div>

                </div>
            </div>)
        }

        let platform = ''
        if (typeof thisElement.platform === 'undefined') {
            platform = ''
        } else {
            platform = 'Консоли: ' + thisElement.platform
        }


        return (
            <div>
                <div style={{
                    background: '#454545', borderRadius: '10px', marginLeft: '10px',
                    marginRight: '10px',
                    width: String(window.innerWidth - 20) + 'px',
                    marginTop: '10px',
                    paddingBottom: '5px'
                }}>
                    <div className={'img-wrap'} onClick={resizeImg}
                         style={{
                             width: String(window.innerWidth - 20) + 'px', height: String(heightImg) + 'px',
                             transitionProperty: 'height',
                             transitionDuration: '0.2s', transitionBehavior: 'allow-discrete'
                         }}>
                        <img src={url}
                             style={{borderTopRightRadius: '10px', borderTopLeftRadius: '10px',}}/>
                    </div>
                    <div style={{
                        color: 'white',
                        fontSize: '22px',
                        textAlign: 'center',
                        fontFamily: "'Montserrat', sans-serif",
                        marginTop: '7px',
                        marginBottom: '7px'
                    }}>{thisElement.name + ' ' + thisElement.choiceRow}</div>
                    <div style={{
                        display: 'grid',
                        alignItems: 'center',
                        width: String(window.innerWidth - 20) + 'px',
                        border: '1px gray solid',
                        borderRadius: '7px',
                        marginBottom: '7px'
                    }}>
                        <div style={{
                            background: '#414BE0FF',
                            width: String(((window.innerWidth - 20 - 2 - 2) - (data.length - 1) * 2) / data.length) + 'px',
                            height: '45px',
                            marginTop: '2px',
                            marginBottom: '2px',
                            borderRadius: '5px',
                            position: 'relative',
                            marginLeft: String(cordchoiceColumn) + 'px',
                            transitionProperty: 'margin-left',
                            transitionDuration: '0.2s',
                        }}></div>

                        {data.map(el => (
                            <div key={el.id} style={{
                                position: 'absolute',
                                marginLeft: String((el.id) * (window.innerWidth - 20) / data.length) + 'px',
                                width: String((window.innerWidth - 30) / data.length) + 'px',
                                height: '50px',
                            }}>
                                <div style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    display: 'flex',
                                    height: '50px',
                                    overflow: 'hidden',
                                }} onClick={() => {
                                    setSelectChoiceColumn(el.id)
                                    setSelectChoiceRow(0)
                                }}>
                                    <div style={{color: 'white', fontFamily: "'Montserrat', sans-serif"}}>
                                        {el.name}
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                    {scrollerchoiceRow}
                    <div style={{marginLeft: '10px', width: String(window.innerWidth - 40) + 'px'}}>
                        <div style={{
                            marginTop: '7px',
                            fontSize: '14px',
                            color: 'white',
                            textWrap: 'wrap',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>Описание:
                        </div>
                        <div style={{
                            marginTop: '7px',
                            fontSize: '14px',
                            color: 'white',
                            textWrap: 'wrap',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>{thisElement.description}
                        </div>
                        <div style={{
                            marginTop: '7px',
                            fontSize: '14px',
                            color: 'white',
                            textWrap: 'wrap',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>{platform}
                        </div>
                    </div>
                    <button className={'all-see-button'} onClick={buttonLink}
                            style={{
                                background: buttonColor,
                                width: String(window.innerWidth - 20 - 8) + 'px',
                                transitionProperty: 'background',
                                transitionDuration: '0.2s',
                            }}>{buttonText}
                    </button>
                </div>
            </div>
        );
    } else {
        return (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>)
    }
};

export default ProductListSelector;