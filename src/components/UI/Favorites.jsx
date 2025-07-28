import React, {useEffect, useState} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {Link, useNavigate} from "react-router-dom";
import {useServerUser} from "../../hooks/useServerUser";

const Favorites = () => {

    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const [cardList, setCardList] = useState(null)
    const {getFavoriteList} = useServerUser()

    if(cardList === null){
        console.log(cardList)
        getFavoriteList(setCardList, user.id).then()
    }

    useEffect(() => {
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }
    }, [])

    if (cardList === null) {
        return (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>);
    } else {
        if (cardList.length === 0) {
            return (
                <div style={{display: 'grid'}}>
                    <div style={{
                        height: String(window.innerHeight - 60 - 15 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
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
                    <Link to={'/'} className={'link-element'}>
                        <button className={'all-see-button'} style={{marginTop: '10px', width: String(300) + 'px'}}>На
                            главную
                        </button>
                    </Link>
                </div>)
        } else {
            return (
                <div style={{display: 'grid'}}>
                        <div className={'title'} style={{
                            width: String(window.innerWidth) + 'px', textAlign: 'center',
                            marginRight: 'auto',
                            marginTop: '3px',
                            marginLeft: '0',
                            marginBottom:'0px'
                        }}>Избранное
                        </div>
                        {cardList.map(item => {
                            let platform = ''
                            if (typeof item.platform !== 'undefined') {
                                if (typeof item.view === 'undefined') {
                                    platform = item.platform
                                } else {
                                    platform = item.view
                                }
                            } else {
                                platform = ''
                            }

                            let price = ''
                            if (item.isSale) {
                                price = item.price + ' ₽'
                            } else {
                                price = 'Нет в продаже!'
                            }

                            let oldPrice = ''
                            let parcent = ''
                            if (typeof item.oldPrice === 'undefined') {
                                if (typeof item.releaseDate === 'undefined') {
                                    parcent = ''
                                } else {
                                    parcent = item.releaseDate.replace('#', '')
                                    parcent = parcent.slice(0, 6)+ parcent.slice(8, 10)
                                }
                            } else {
                                oldPrice = String(item.oldPrice) + ' ₽'
                                parcent = '−'+String(Math.ceil((1-item.price/item.oldPrice)*100))+'%'
                            }

                            let endDatePromotion = ''
                            if (typeof item.endDatePromotion === 'undefined') {
                                endDatePromotion = ''
                            } else {
                                endDatePromotion = 'Скидка ' + parcent + ' ' + item.endDatePromotion
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
                            if (typeof item.oldPrice === 'undefined') {
                                if (typeof item.releaseDate === 'undefined') {
                                    parcent = ''
                                    type = 0
                                } else {
                                    parcent = item.releaseDate
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
                            }}>{item.price+' ₽'}</div>)

                            let oldPriceEl = (<div></div>)

                            if (type === 1) {
                                priceEl = (<div className={'text-element text-basket'} style={{
                                    lineHeight: '15px',
                                    marginTop: '0',
                                    height: '15px',
                                    fontSize: '15px',
                                    color: '#ff5d5d',
                                    marginRight:'0px'
                                }}>{item.price+' ₽'}</div>)
                                oldPriceEl = (<div className={'text-element text-basket'} style={{
                                    lineHeight: '15px',
                                    marginTop: '0',
                                    height: '15px',
                                    fontSize: '15px',
                                    color:'gray',
                                    textDecoration:'line-through'
                                }}>{item.oldPrice+' ₽'}</div>)
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
                                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', padding:'5px', background:'#232323', borderRadius:'10px', margin:'10px 0 0 10px', width:String(window.innerWidth-20)+'px'}}>
                                    <Link to={'/card/' + item.id} className={'link-element'}
                                          style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                                        <div className={'img'} style={{
                                            height:'80px',
                                            width:'80px',
                                            borderRadius: '7px',
                                            backgroundImage: "url('" + item.image + "')",
                                            backgroundSize: 'cover',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'end',
                                            justifyContent: 'space-between',
                                        }}></div>
                                        <div style={{
                                            width: String(window.innerWidth - 140) + 'px',
                                            display: 'grid',
                                            gridTemplateRows: '30fr 15px 15fr',
                                            height:'75px'
                                        }}>
                                            <div className={'text-element text-basket'} style={{
                                                marginTop: '5px',
                                                lineHeight: '15px',
                                                height: '30px',
                                                fontSize: '13px',
                                                overflow: 'hidden',
                                                display: 'flex',
                                            }}>{platform + ' • ' + item.name}</div>
                                            <div style={{
                                                marginTop:'0px',
                                                display: 'flex',
                                                justifyContent: 'left',
                                                alignItems: 'center',
                                                height: '15px'
                                            }}>
                                                {priceEl}
                                                {oldPriceEl}
                                            </div>
                                            <div className={'text-element'} style={{
                                                fontSize: '13px',
                                                color: '#696969',
                                                overflow: 'hidden',
                                                lineHeight: '15px',
                                                height: '15px',
                                                marginTop:'5px'
                                            }}>
                                                {endDatePromotion}
                                            </div>
                                        </div>
                                    </Link>
                                    <div onClick={() => {

                                    }} style = {{justifyContent:'center', alignContent:"center", marginRight:'20px'}}>
                                        <div className={'background-trash'}
                                             style={{padding: '10px', height: '20px', width: '20px'}}>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

            );
        }
    }
};

export default Favorites;