import React, {useEffect, useRef, useState} from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import {useServer} from "./useServer";
import useGlobalData from "../../../../hooks/useGlobalData";
import Recommendations from "./Recommendations";
import style from './Product.module.scss'
import Description from "./Description";
import ChoiceElement from "./ChoiceElement";

const parameters = [{label: 'Платформа', key: 'platform'}, {
    label: 'Регион активации', key: 'regionActivate'
}, {label: 'Язык в игре', key: 'language'}, {
    label: 'Дата релиза', key: (item) => {
        let a = (new Date(item.releaseDate)) * 24 * 60 * 60 * 1000
        let currentDate = new Date('1899-12-30T00:00:00.000Z')
        let newDate = new Date(a + currentDate.getTime());

        if (newDate < ((new Date()))) {
            return "Уже в продаже"
        } else {
            return newDate.toLocaleDateString('ru-RU')
        }
    }
}, {label: 'Количество игроков', key: 'numberPlayers'},]

const Product = () => {

    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const {getCard, addCardToFavorite, deleteCardToFavorite, addCardToBasket, findCardsByCatalog} = useServer()
    const {
        updatePreviewFavoriteData, previewFavoriteData, pageId, pageList, basket, catalogList, updateBasket
    } = useGlobalData()

    let cardId = Number((window.location.pathname).replace('/card/', ''))

    const [productData, setProductData] = useState(null);
    const [selectCardList, setSelectCardList] = React.useState(null);
    const [selectGroup, setSelectGroup] = React.useState(0);
    const [selectPosition, setSelectPosition] = React.useState(0);
    const [buttonHidden, setButtonHidden] = React.useState(false);
    const blockRef = useRef(null);

    let flag = false
    basket.map(pos => {
        if (pos.id === cardId) {
            flag = true;
        }
    })

    const [cardInBasket, setCardInBasket] = useState(flag)
    const [cardInFavorite, setCardInFavorite] = useState(previewFavoriteData.includes(cardId))

    if ((productData !== null && !isNaN(cardId) && cardId !== productData.id) || (productData !== null && selectCardList !== null && productData.id !== selectCardList[selectGroup]?.body[selectPosition]?.id)) {
        setProductData(null)
        if (isNaN(cardId)) {
            cardId = selectCardList[selectGroup].body[selectPosition].id
        } else {
            setSelectCardList(null)
            setSelectGroup(0)
            setSelectPosition(0)
        }

        let flag = false
        basket.map(pos => {
            if (pos.id === cardId) {
                flag = true
            }
        })
        setCardInBasket(flag)
        setCardInFavorite(previewFavoriteData.includes(cardId))
    }
    if (productData !== null && isNaN(cardId) && selectCardList === null) {
        setProductData(null)
        setSelectGroup(0)
        setSelectPosition(0)
    }

    useEffect(() => {
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }

    }, [])

    if (productData !== null) {

        let oldPrice = ''
        let price = productData.price.toLocaleString() + ' ₽'
        let endDatePromotion = ''
        let percent = ''

        if (productData.endDatePromotion !== null) {
            endDatePromotion = `*cкидка действует ${productData.endDatePromotion}`
        }
        if (productData.oldPrice !== null) {
            oldPrice = productData.oldPrice.toLocaleString() + ' ₽'
            percent = '-' + Math.ceil((1 - productData.price / productData.oldPrice) * 100) + '%'
        } else if (productData.similarCard !== null) {
            price = productData.similarCard?.price.toLocaleString() + ' ₽'
            if (typeof productData.similarCard.oldPrice !== 'undefined') {
                oldPrice = productData.similarCard?.oldPrice.toLocaleString() + ' ₽'
                percent = '-' + Math.ceil((1 - productData.similarCard?.price / productData.similarCard?.oldPrice) * 100) + '%'
            }
            if (typeof productData.similarCard.endDatePromotion !== 'undefined') {
                endDatePromotion = `*cкидка действует ${productData.similarCard?.endDatePromotion}`
            }
        }

        return (<div className={style['container']} style={{
            paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
            paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 0.17 * window.innerWidth) + 'px',
            height: '100vh',
        }} onScroll={(event) => {
            let scroll = event.target.scrollTop
            let height = blockRef.current.clientHeight + (window.innerWidth * 1.2)

            if (scroll > height && !buttonHidden) {
                setButtonHidden(true)
            } else if (scroll < height && buttonHidden) {
                setButtonHidden(false)
            }

        }}>
            <div className={style['productImage']}
                 style={{backgroundImage: 'url(' + (selectCardList !== null ? productData.image : productData.image.slice(0, productData.image.indexOf('?w=') + 1) + "w=1024") + ')'}}>
                {percent !== '' ? (<div className={style['percent']}>{percent}</div>) : ''}
                <button className={style['favorite']} style={{marginLeft: (percent !== '' ? '0' : '78.91vw')}}
                        onClick={async () => {
                            if (cardInFavorite) {
                                setCardInFavorite(false)
                                await deleteCardToFavorite(() => {
                                    updatePreviewFavoriteData()
                                }, user.id, productData.id)
                            } else {
                                setCardInFavorite(true)
                                await addCardToFavorite(() => {
                                    updatePreviewFavoriteData()
                                }, user.id, productData.id)
                            }
                        }}>
                    <div/>
                    <div style={{scale: (cardInFavorite ? '1' : '0.5'), opacity: (cardInFavorite ? '1' : '0')}}/>
                </button>
            </div>

            <div className={style['priceNameBlock']} ref={blockRef}>
                <p className={style['title']}>{productData.name}</p>

                {selectCardList !== null && selectCardList.length > 1 ? (
                    <ChoiceElement list={selectCardList} parameter={'name'} index={selectGroup} set={(index) => {
                        setSelectGroup(index);
                        setSelectPosition(0)
                    }}/>) : ''}
                {selectCardList !== null ? (
                    <ChoiceElement list={selectCardList[selectGroup]?.body} parentIndex={selectGroup}
                                   parameter={'choiceRow'}
                                   index={selectPosition} set={setSelectPosition}/>) : ''}

                <div className={style['price']}>
                    <div style={{borderColor: oldPrice !== '' ? '#D86147' : '#171717'}}>{price}</div>
                </div>
                {endDatePromotion !== '' ? (<div className={style['endDatePromotion']}>
                    {endDatePromotion}
                </div>) : ''}
                <div className={style['parameters']}>
                    {parameters.map((parameter, index) => {
                        if (productData[parameter.key] !== null && productData[parameter.key] !== '') {
                            return (<div key={index}>
                                <div>{parameter.label}:</div>
                                <div>{typeof parameter.key !== 'function' ? productData[parameter.key] : parameter.key(productData)}</div>
                            </div>)
                        }
                    })}
                </div>
            </div>

            <Description>{productData.description}</Description>

            <Recommendations/>

            <div className={style['basketButton']}
                 style={{
                     paddingBottom: (buttonHidden ? '0' : String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom) + 'px'),
                     height: (buttonHidden ? '0' : String((0.15 * window.innerWidth) + tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom
                     ) + 'px'),
                 }}>
                <button onClick={() => {
                    if (productData.onSale) {
                        cardInBasket ? navigate('/' + pageList.map(page => {
                            return pageId === page.id ? page.link : null
                        }).filter(page => page !== null)[0] + '/basket') : addCardToBasket(() => {
                            setCardInBasket(true)
                        }, user.id, productData.id)
                        setTimeout(() => {
                            updateBasket(catalogList, pageId)
                        }, 250)
                    }
                }}
                        style={{background: productData.onSale ? cardInBasket ? '#50A355' : '#404ADE' : '#585c59'}}>
                    {productData.onSale ? cardInBasket ? 'В корзине / перейти в корзину' : 'Добавить в корзину' : 'Нет в продаже'}
                </button>
            </div>
        </div>);
    } else {
        if (!isNaN(cardId)) {
            getCard(setProductData, cardId).then()
        } else if (selectCardList === null) {
            let catalogId = 0
            catalogList.map(el => {
                if (el.path === window.location.pathname.replace('/choice-catalog/', '')) catalogId = el.id
            })
            findCardsByCatalog(catalogId, (result) => {
                let data = []

                result.sort((a, b) => {
                    return b.serialNumber > a.serialNumber ? -1 : 1
                }).map((card) => {
                    let group = data.filter(el => el.name === card.choiceColumn)
                    if (group.length > 0) {
                        data[group[0].id].body.push(card)
                    } else {
                        data.push({id: data.length, name: card.choiceColumn, body: [card]})
                    }
                })

                setSelectCardList(data)
                setProductData(data[selectGroup].body[selectPosition])
            }).then()
        } else {
            setProductData(selectCardList[selectGroup].body[selectPosition])
        }
    }
};

export default Product;
