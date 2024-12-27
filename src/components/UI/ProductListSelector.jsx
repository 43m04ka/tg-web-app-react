import React, {useCallback, useEffect} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";

const ProductListSelector = ({main_data, page, height}) => {
    const [selectCategory, setSelectCategory] = React.useState(0);
    const [selectView, setSelectView] = React.useState(0);
    const [isImgHidden, setIsImgHidden] = React.useState(true);

    const dataOld = main_data.body;
    let data = []
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    let lastName = ''
    let vsArray = []
    let lastId = 0
    dataOld.map(el => {
        if (lastName !== el.category) {
            data = [...data, ...vsArray]
            lastName = el.category
            vsArray = [{}]
            vsArray[0].id = lastId
            vsArray[0].title = el.category
            vsArray[0].body = [el]
            lastId += 1
        } else {
            vsArray[0].body = [...vsArray[0].body, ...[el]]
        }

    })
    data = [...data, ...vsArray]

    const onBack = useCallback(async () => {
        navigate(-1);
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

    let cordCategory = (window.innerWidth - 20 - 2 - 2) / data.length * selectCategory + 1.5
    let cordView = (window.innerWidth - 20 - 2 - 2) / data[selectCategory].body.length * selectView + 1.5

    let url = data[selectCategory].body[selectView].img

    let thisElement = dataOld[(selectCategory) * data[0].body.length + selectView]

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

    const sendData = {
        method:'add',
        mainData: thisElement,
        user: user,
    }

    const onSendData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => console.log(r))
    }, [sendData])

    console.log(data);
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
                     style={{width: String(window.innerWidth - 20) + 'px', height: String(heightImg) + 'px', transitionProperty:'height', transitionDuration:'0.2s', transitionBehavior:'allow-discrete'}}>
                    <img src={url}
                         style={{borderTopRightRadius: '10px', borderTopLeftRadius: '10px'}}/>
                </div>
                <div style={{
                    color: 'white',
                    fontSize: '22px',
                    textAlign: 'center',
                    fontFamily: "Argentum Sans VF Arial",
                    marginTop: '7px',
                    marginBottom: '7px'
                }}>{thisElement.title + ' ' + thisElement.view}</div>
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
                        marginLeft: String(cordCategory) + 'px',
                        transitionProperty: 'margin-left',
                        transitionDuration: '0.2s',
                    }}></div>

                    {data.map(el => (
                        <div key={el.id} style={{
                            position: 'absolute',
                            marginLeft: String((el.id) * (window.innerWidth - 20) / data.length) + 'px',
                            width: String((window.innerWidth - 30) / data.length) + 'px',
                            height: '50px'
                        }}>
                            <div style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '50px',
                                overflow: 'hidden',
                            }} onClick={() => {
                                setSelectCategory(el.id)
                                setSelectView(0)
                            }}>
                                <div style={{color: 'white',}}>
                                    {el.title}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
                <div style={{
                    display: 'grid',
                    alignItems: 'center',
                    width: String(window.innerWidth - 20) + 'px',
                    border: '1px gray solid',
                    borderRadius: '10px',
                }}>
                    <div style={{
                        background: '#414BE0FF',
                        width: String(((window.innerWidth - 20 - 2 - 2) - (data[selectCategory].body.length - 1) * 2) / data[selectCategory].body.length) + 'px',
                        height: '95px',
                        borderRadius: '7px',
                        marginTop: '2px',
                        marginBottom: '2px',
                        marginRight: '2px',
                        position: 'relative',
                        marginLeft: String(cordView) + 'px',
                        transitionProperty: 'margin-left',
                        transitionDuration: '0.2s',
                    }}></div>
                    {data[selectCategory].body.map(el => (
                        <div key={el.id} style={{
                            position: 'absolute',
                            marginLeft: String(((el.id - 1) % 3) * (window.innerWidth - 20) / data[selectCategory].body.length + 'px'),
                            width: String((window.innerWidth - 30) / data[selectCategory].body.length) + 'px',
                            height: '100px'
                        }}>
                            <div style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '95px',
                                overflow: 'hidden',
                                width: String((window.innerWidth - 30) / data[selectCategory].body.length) + 'px',
                            }} onClick={() => {
                                setSelectView(((el.id - 1) % 3))
                            }}>
                                <div style={{
                                    color: 'white',
                                    height: '70px',
                                    display: 'grid',
                                    gridTemplateRows: '1fr 1fr',
                                    justifyItems: 'center',
                                    alignItems: 'center'
                                }}>
                                    <div style={{fontSize: '13px'}}>{el.view}</div>
                                    <div style={{fontSize: '22px'}}>{el.price + ' ₽'}</div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
                <div style={{
                    marginTop: '7px',
                    fontSize: '14px',
                    color: 'white',
                    fontFamily: "Argentum Sans VF Arial"
                }}>Описание:
                </div>
                <div style={{
                    marginTop: '7px',
                    fontSize: '14px',
                    color: 'white',
                    fontFamily: "Argentum Sans VF Arial"
                }}>{thisElement.description}
                </div>
                <div style={{
                    marginTop: '7px',
                    fontSize: '14px',
                    color: 'white',
                    fontFamily: "Argentum Sans VF Arial"
                }}>{'Платформа: ' + thisElement.platform}
                </div>
                <button className={'all-see-button'} onClick={onSendData}
                        style={{background: '#51a456', width: String(window.innerWidth - 20 - 8) + 'px'}}>Добавить в
                    корзину
                </button>
            </div>
        </div>
    );
};

export default ProductListSelector;