import React, {useCallback, useEffect, useState} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {Link, useNavigate} from "react-router-dom";
import ProductItemBasket from "./ProductItemBasket";

const Favorites = ({height}) => {

    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const [status, setStatus] = useState(0);
    const [favorites, setFavorites] = useState([])


    const sendData = {
        method: 'get',
        mainData: '',
        user: user,
    }

    const onGetData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(r => {
                let newArray = []
                r.body.map(el => {
                    if (el.body.isSale) {
                        newArray = [...newArray, el]
                    }
                })
                setFavorites(newArray);
                setStatus(1)
            })
        })
    }, [sendData])

    let onBack = useCallback(async () => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    if (status === 0) {
        sendData.mainData = 'get'
        onGetData()
        return (<div className={'plup-loader'} style={{
            marginTop: String(height / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>);
    } else if (status === 1) {
        if (favorites.length === 0) {
            return (
                <div style={{display: 'grid'}}>
                    <div style={{
                        height: String(height - 60 - 15 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                        marginTop: '15px', textAlign: 'center',
                        color: 'gray', fontSize: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} className={'text-element'}>
                        <div className={'background-basketSaid'} style={{width: '65px', height: '83px'}}/>
                        <div className={'text-element'}>В избранном ничего нет...</div>
                    </div>
                    <Link to={'/home0'} className={'link-element'}>
                        <button className={'all-see-button'} style={{marginTop: '10px', width: String(300) + 'px'}}>На
                            главную
                        </button>
                    </Link>
                </div>)
        } else {
            return (
                <div style={{display: 'grid'}}>
                    <div style={{
                        height: String(height - 110 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                        overflow: 'scroll'
                    }}>
                        <div className={'title'} style={{
                            width: String(window.innerWidth) + 'px', textAlign: 'center',
                            marginRight: 'auto',
                            marginTop: '10px',
                            marginLeft: '0',
                        }}>Избранное
                        </div>
                        {favorites.map(item => {


                            let platform = ''
                            if (typeof item.body.platform !== 'undefined') {
                                if (typeof item.body.view === 'undefined') {
                                    platform = item.body.platform
                                } else {
                                    platform = item.body.view
                                }
                            } else {
                                platform = ''
                            }

                            let price = ''
                            if (item.body.isSale) {
                                price = item.body.price + ' ₽'
                            } else {
                                price = 'Нет в продаже!'
                            }

                            let oldPrice = ''
                            let parcent = ''
                            if (typeof item.body.oldPrice === 'undefined') {
                                if (typeof item.body.releaseDate === 'undefined') {
                                    parcent = ''
                                } else {
                                    parcent = item.body.releaseDate.replace('#', '')
                                    parcent = parcent.slice(0, 6)+ parcent.slice(8, 10)
                                }
                            } else {
                                oldPrice = String(item.body.oldPrice) + ' ₽'
                                parcent = '−'+String(Math.ceil((1-item.body.price/item.body.oldPrice)*100))+'%'
                            }
                            let parcentEl = (<div></div>)
                            if(parcent !== ''){
                                parcentEl = (<div style={{
                                    lineHeight: '20px',
                                    background: '#ff5d5d',
                                    paddingLeft: '3px',
                                    paddingRight: '3px',
                                    borderRadius: '5px',
                                    marginBottom: '5px',
                                    textDecoration: 'none',
                                    textAlign: 'left',
                                    marginRight: '5px',
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    overflow: 'hidden',
                                    color: 'white',
                                    width: 'max-content',
                                    height:'20px'
                                }}>{parcent}</div>)
                            }

                            let type = 0
                            if (typeof item.body.oldPrice === 'undefined') {
                                if (typeof item.body.releaseDate === 'undefined') {
                                    parcent = ''
                                    type = 0
                                } else {
                                    parcent = item.body.releaseDate.replace('#', '')
                                    parcent = parcent.slice(0, 6) + parcent.slice(8, 10)
                                    type = 2
                                }
                            } else {
                                type = 1
                            }
                            let priceEl = (<div className={'text-element text-basket'} style={{
                                lineHeight: '15px',
                                marginTop: '0',
                                height: '15px',
                                fontSize: '15px',
                            }}>{item.body.price+' ₽'}</div>)

                            let oldPriceEl = (<div></div>)

                            if (type === 1) {
                                priceEl = (<div className={'text-element text-basket'} style={{
                                    lineHeight: '15px',
                                    marginTop: '0',
                                    height: '15px',
                                    fontSize: '15px',
                                    color: '#ff5d5d',
                                }}>{item.body.price+' ₽'}</div>)
                                oldPriceEl = (<div className={'text-element text-basket'} style={{
                                    lineHeight: '15px',
                                    marginTop: '0',
                                    height: '15px',
                                    fontSize: '15px',
                                    color:'gray',
                                    textDecoration:'line-through'
                                }}>{item.body.oldPrice+' ₽'}</div>)
                            }
                            if(type === 2){
                                oldPriceEl = (<div className={'text-element text-basket'} style={{
                                    lineHeight: '15px',
                                    marginTop: '0',
                                    height: '15px',
                                    fontSize: '15px',
                                    color: '#4a9ed6',
                                }}>Предзаказ</div>)
                            }

                            return (
                                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', padding:'5px', background:'#232323', borderRadius:'10px', margin:'10px'}}>
                                    <Link to={'/card/' + item.id} className={'link-element'}
                                          style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                                        <div className={'img'} style={{
                                            height:'75px',
                                            width:'75px',
                                            borderRadius: '7px',
                                            backgroundImage: "url('" + item.body.img + "')",
                                            backgroundSize: 'cover',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'end',
                                            justifyContent: 'space-between',
                                        }}></div>
                                        <div className={'box-grid-row'}>
                                            <div style={{display:'flex'}}>
                                            <div className={'text-element text-basket'} style={{
                                                marginTop: '3px',
                                                lineHeight: '15px',
                                                height: '30px',
                                                fontSize: '13px',
                                                overflow: 'hidden',
                                                display:'flex',
                                                maxWidth:String(window.innerWidth-250)+'px'
                                            }}>{item.body.title}</div>
                                                {parcentEl}
                                            </div>
                                            <div className={'text-element text-basket'} style={{
                                                marginTop: '3px',
                                                lineHeight: '14px',
                                                height: '14px',
                                                fontSize: '9px',
                                                overflow: 'hidden',
                                                marginBottom: '0px'
                                            }}>{platform}</div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'left',
                                                alignItems: 'center',
                                                height: '15px'
                                            }}>
                                                {priceEl}
                                                {oldPriceEl}
                                            </div>
                                        </div>
                                    </Link>
                                    <div onClick={() => {
                                        sendData.mainData = item.id;
                                        sendData.method = 'del'
                                        onGetData()
                                    }} style = {{justifyContent:'center', alignContent:"center", marginRight:'20px'}}>
                                        <div className={'background-trash'}
                                             style={{padding: '10px', height: '20px', width: '20px'}}>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            );
        }
    }
};

export default Favorites;