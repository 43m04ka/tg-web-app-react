import React, {useEffect, useRef, useState} from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import {useServer} from "./useServer";
import useGlobalData from "../../../../hooks/useGlobalData";
import Recommendations from "../../Elements/Recommendations/Recommendations";
import style from './Product.module.scss'
import Description from "./Elements/Description";
import ChoiceElement from "./Elements/ChoiceElement";
import DescriptionImages from "./Elements/DescriptionImages";
import ProductBasketCounter from "./Elements/ProductBasketCounter";
import SimilarProducts from "./Elements/SimilarProducts";
import ShareLabels from "./Elements/ShareLabels";
import BackgroundImage from "./Elements/BackgroundImage";
import NamePlace from "./Elements/NamePlace";

const parameters = [{label: 'Платформа', key: 'platform', type: 'bubble'}, {
    label: 'Регион активации', key: 'regionActivate', type: 'parameter'
}, {label: 'Язык в игре', key: 'language', type: 'bubble'}, {
    label: 'Дата релиза', key: (item) => {
        if (item.releaseDate !== null && !Number.isNaN(Number(item.releaseDate)) && item.releaseDate.trim() !== "" || (new Date(item.releaseDate)).getFullYear() < 1980) {
            let a = (new Date(item.releaseDate)) * 24 * 60 * 60 * 1000
            let currentDate = new Date('1899-12-30T00:00:00.000Z')
            let newDate = new Date(a + currentDate.getTime());

            if (newDate < ((new Date()))) {
                return "Уже в продаже"
            } else {
                return newDate.toLocaleDateString('ru-RU')
            }
        }else if(item.releaseDate !== null && item.releaseDate !== '') {
            return (new Date(item.releaseDate)).toLocaleDateString('ru-RU')
        }else{
            return null
        }
    }, type: 'bubble'
}, {label: 'Количество игроков', key: 'numberPlayers', type: 'bubble'},
    {label: 'Тип', key: 'typeLabel', type: 'bubble'},]

const Product = () => {

    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const {
        getCard, addCardToBasket, findCardsByCatalog,
    } = useServer()
    const {
        previewFavoriteData,
        pageId,
        pageList,
        basket,
        catalogList,
        updateBasket,
        bufferCardsCatalog,
        bufferCardsRecommendations,
        mainPageCards
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
        tg.onEvent('backButtonClicked', () => {
            navigate(-1)
        })
        return () => {
            tg.offEvent('backButtonClicked', () => {
                navigate(-1)
            })
        }
    }, [])

    if (productData !== null) {

        let oldPrice = ''
        let price = productData.price.toLocaleString() + ' ₽'


        if (productData.oldPrice !== null) {
            oldPrice = productData.oldPrice.toLocaleString() + ' ₽'
        } else if (productData.similarCard !== null) {
            price = productData.similarCard?.price.toLocaleString() + ' ₽'
            if (typeof productData.similarCard.oldPrice !== 'undefined') {
                oldPrice = productData.similarCard?.oldPrice.toLocaleString() + ' ₽'
            }
        }


        let saleType = null
        let saleLabel = ''

        if (productData.additionalParameter !== null) {
            if (productData.additionalParameter.includes('Save') && productData.additionalParameter.includes('ps-plus')) {
                saleType = 'logoPS'
                saleLabel = 'ДОПОЛНИТЕЛЬНАЯ \n СКИДКА С PS PLUS'
            }
            if (productData.additionalParameter.includes('Extra')) {
                saleType = 'logoPS'
                saleLabel = 'БЕСПЛАТНО \n С PS PLUS EXTRA'
            }
            if (productData.additionalParameter.includes('Deluxe')) {
                saleType = 'logoPS'
                saleLabel = 'БЕСПЛАТНО \n С PS PLUS DELUXE'
            }
            if (productData.additionalParameter.includes('Included')) {
                saleType = 'logoEA'
                saleLabel = 'БЕСПЛАТНО \n С EA PLAY'
            }
        }


        return (<div className={style['container']} style={{
            paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
            paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 0.2 * window.innerWidth) + 'px',
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
            <BackgroundImage productData={productData} selectCardList={selectCardList}/>

            <div className={style['priceNameBlock']} ref={blockRef}>

                <NamePlace productData={productData} cardInFavorite={cardInFavorite}
                           setCardInFavorite={setCardInFavorite}/>

                {selectCardList !== null && selectCardList.length > 1 ? (<ChoiceElement list={selectCardList}
                                                                                        isXbox={productData.name.toLowerCase().includes('game pass')}
                                                                                        parameter={'name'}
                                                                                        index={selectGroup}
                                                                                        set={(index) => {
                                                                                            setSelectGroup(index);
                                                                                            setSelectPosition(0)
                                                                                        }}/>) : ''}
                {selectCardList !== null ? (<ChoiceElement list={selectCardList[selectGroup]?.body}
                                                           isXbox={productData.name.toLowerCase().includes('game pass')}
                                                           parentIndex={selectGroup}
                                                           parameter={'choiceRow'}
                                                           index={selectPosition}
                                                           set={setSelectPosition}/>) : ''}

                <div className={style['price']}>
                    <div>
                        <p style={{color: oldPrice !== '' ? '#D86147' : '#ffffff'}}>{price}</p>
                        {oldPrice !== '' ? <p>{oldPrice}</p> : ''}
                    </div>
                    {saleType !== null ?
                        <div style={{borderColor: '#171717'}} className={style['sale'] + ' ' + style['bg-' + saleType]}
                             onClick={() => {
                                 navigate(saleType === 'logoPS' ? '/choice-catalog/ps_psplus' : '/choice-catalog/ps_eaplay')
                             }}>
                            <div className={style[saleType]}/>
                            <div className={style[saleType]}/>
                            <div className={style[saleType]}/>
                            <div className={style[saleType]}/>
                            <p>{saleLabel}</p>
                            <div/>
                        </div> : ''}
                </div>

                {/*<InfoBubbles parameters={parameters} productData={productData}/>*/}

                <DescriptionImages data={productData.descriptionImages}/>

                <Description productData={productData} parameters={parameters}/>
            </div>

            {/*<SimilarProducts name={productData.name}*/}
            {/*                 minRating={productData.name.replace(/[^a-zA-Z0-9\s]/g, "").split(' ')[0].length}*/}
            {/*                 id={productData.id}/>*/}

            <Recommendations horizontal={true}/>

            <ShareLabels productData={productData} parameters={parameters}/>

            <div className={style['basketButton']}
                 style={{
                     paddingBottom: (buttonHidden ? '0' : String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom) + 'px'),
                     height: (buttonHidden ? '0' : String((0.15 * window.innerWidth) + tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom) + 'px'),
                 }}>
                <button onClick={async () => {
                    if (productData.onSale) {
                        if (cardInBasket) {
                            let params = new URLSearchParams(window.location.search);
                            let valueOfKey = params.get('from');

                            navigate('/' + pageList.map(page => {
                                return pageId === page.id ? page.link : null
                            }).filter(page => page !== null)[0] + (valueOfKey !== 'basket' ? '/basket?from=product' : '/basket'))
                        } else {
                            await addCardToBasket(async () => {
                                await setCardInBasket(true)
                                await updateBasket(catalogList, pageId)
                            }, user.id, productData.id)
                        }
                    }
                }}
                        style={{background: productData.onSale ? cardInBasket ? '#50A355' : '#404ADE' : '#6e6e6e'}}>
                    {productData.onSale ? cardInBasket ? 'В корзине' : 'Добавить в корзину' : 'Нет в продаже'}
                </button>
                {productData.onSale && cardInBasket ?
                    <ProductBasketCounter idPos={productData.id} setCardInBasket={setCardInBasket}/> : ''}
            </div>
        </div>);
    } else {
        if (!isNaN(cardId)) {
            let bufferedCardList = [...bufferCardsCatalog, ...bufferCardsRecommendations, ...(mainPageCards === null ? [] : mainPageCards)].map(card => {
                return card.id === cardId ? card : null
            }).filter(item => item !== null)

            if (bufferedCardList.length === 1) {
                getCard(setProductData, cardId).then()
                setTimeout(() => {
                    setProductData(bufferedCardList[0])
                }, 50)
            } else {
                getCard(setProductData, cardId).then()
            }
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
