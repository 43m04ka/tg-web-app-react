import React, {useRef, useState} from 'react';
import '../styles/style.css';
import ProductItem from "./ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import FilterCheckBox from "./FilterCheckBox";


const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

let oldFilterHeight = window.innerHeight - 250

const ProductList = ({main_data, page, height}) => {
    console.log(page)
    const [products, setProducts] = useState(main_data.body)
    const path = main_data.path
    const {tg} = useTelegram();
    const navigate = useNavigate();
    const [sortNap, setSortNap] = useState(true);
    const [stpSort, setStpSort] = useState('Цена↑');
    const [filterJson, setFilterJson] = useState({platform: [], category:[]});
    const [filterHeight, setFilterHeight] = useState(0);

    const onBack = useCallback(() => {
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

    const onSort = () => {
        if (sortNap) {
            setSortNap(false)
            setStpSort('Цена↓')
        } else {
            setSortNap(true)
            setStpSort('Цена↑')
        }
    }

    if (sortNap) {
        products.sort((a, b) => (+(a.price - b.price)))
    } else {
        products.sort((a, b) => (+(b.price - a.price)));
    }


    const onSetFilter = (json) => {
        setFilterJson(json)

        let newProducts = []
        if (typeof main_data.body[0].platform !== 'undefined') {
            main_data.body.map(el => {
                let flag = true
                json.platform.map((platform) => {
                    console.log(flag)
                    if (el.platform.includes(platform) && flag) {
                        console.log(platform)
                        newProducts = [...newProducts, el]
                        flag = false
                    }
                })
            })
            console.log(newProducts.length)

        }if (typeof main_data.body[0].category !== 'undefined') {
            main_data.body.map(el => {
                let flag = true
                json.category.map((platform) => {
                    console.log(flag)
                    if (el.category.includes(platform) && flag) {
                        console.log(platform)
                        newProducts = [...newProducts, el]
                        flag = false
                    }
                })
            })
            console.log(newProducts.length)

        }
        if(json.platform.length !== 0 || json.category.length !== 0){
        setProducts(newProducts)}else{setProducts(main_data.body)}

    }
    

    let platformElementFilter = (<div></div>)
    try{
    if (typeof main_data.body[0].platform !== 'undefined') {
        if (main_data.body[0].platform.includes('PS')) {
            platformElementFilter =
                <FilterCheckBox param={'platform'} data={['PS5', 'PS4']} json={filterJson} preview={'Платформа'}
                                setJson={onSetFilter}/>
        } else if (main_data.body[0].platform.includes('One') || products[0].platform.includes('Series')) {
            platformElementFilter =
                <FilterCheckBox param={'platform'} data={['One', 'Series']} json={filterJson} preview={'Платформа'}
                                setJson={onSetFilter}/>
        }
    }}catch (e){}

    let categoryElementFilter = (<div></div>)
    try{

        if (typeof products[0].category !== 'undefined') {
        if (products[0].category.includes('Старый') || products[0].category.includes('Новый')) {
            categoryElementFilter =
                <FilterCheckBox param={'category'} data={['Старый аккаунт', 'Новый аккаунт']} json={filterJson} preview={'Вид активации'}
                                setJson={onSetFilter}/>
        }
    }}catch (e){}


    return (
        <div className={'list'} style={{display: 'flex', flexDirection: 'column'}}>
            <div className={'box-grid-panel'}>
                <Link to={'/search' + String(page)} className={'link-element'}>
                    <div className={'search'} style={{padding: '10px', display: 'flex', flexDirection: 'row'}}>
                        <div className={'background-search'} style={{width: '25px', height: '25px'}}></div>
                        <div style={{
                            height: '25px',
                            alignContent: 'center',
                            marginLeft: '3px',
                            fontSize: "16px",
                            color: 'black',
                            fontFamily: "'Montserrat', sans-serif",
                            fontVariant: 'small-caps'
                        }}>Найти игру, подписку...
                        </div>
                    </div>
                </Link>
                <Link to={'/basket' + page} className={'link-element'}>
                    <div className={'div-button-panel'} style={{padding: '3px'}}>
                        <div className={'background-basket'} style={{width: '100%', height: '100%'}}></div>
                    </div>
                </Link>
                <Link to={'/info'} className={'link-element'}>
                    <div className={'div-button-panel'} style={{padding: '6px'}}>
                        <div className={'background-profile'} style={{width: '100%', height: '100%'}}></div>
                    </div>
                </Link>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <div style={{}}>
                    <div onClick={() => {
                        if (filterHeight === oldFilterHeight) {
                            setFilterHeight(0)
                        } else {
                            setFilterHeight(oldFilterHeight)
                        }
                    }} className={'text-element'}
                         style={{marginLeft: '15px', fontSize: '18px', lineHeight: '20px'}}>Фильтры
                    </div>
                    <div style={{
                        display: 'flex',
                        marginTop: '7px',
                        marginLeft: '10px',
                        flexDirection: 'column',
                        justifyContent: 'left',
                        position: 'absolute',
                        overflow: 'hidden',
                        height: String(filterHeight) + 'px',
                        width: String(window.innerWidth / 2) + 'px',
                    }}>
                        <div style={{
                            border: '2px solid gray',
                            borderRadius: '7px',
                            height: 'max-content',
                            background: '#171717',
                            transitionProperty: 'height',
                            transitionDuration: '0.3s',
                        }}>
                            <div style={{position: 'relative'}}>{platformElementFilter}</div>
                            <div style={{position: 'relative'}}>{categoryElementFilter}</div>

                        </div>
                    </div>
                </div>
                <div className={'text-element'} style={{
                    fontSize: '18px',
                    marginBottom: '5px',
                    marginRight: '15px',
                    lineHeight: '20px'
                }}>
                    <div onClick={onSort}>{stpSort}</div>
                </div>
            </div>
            <div className={'scroll-container-y'}
                 style={{height: String(height - 90 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px'}}>
                <div className={'list-grid'}>
                    {products.map(item => (
                        <ProductItem key={item.id} product={item} path={path}/>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductList;