import {useEffect, useRef, useState} from 'react';
import style from './Search.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";
import HomeScreen from "./Elements/homeScreen";
import useGlobalData from "../../../../hooks/useGlobalData";
import CatalogItem from "../Catalog/CatalogItem";

let timerId = -1


const Search = () => {
    const {tg} = useTelegram()
    const {pageId} = useGlobalData()
    const inputRef = useRef(null)

    const [inputValue, setInputValue] = useState('')
    const [cardList, setCardList] = useState(null)
    const [isInputFocused, setIsInputFocused] = useState(false);

    const getCardList = async () => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({
                method: 'getSearch', data: {str: inputValue, pageId: pageId}
            })
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                let resultList = []
                prom.cards.map(card => {
                    let flag = true
                    resultList.map(resCard => {
                        if (card.name === resCard.name && card.similarCard?.price === resCard.similarCard?.price && card.similarCard?.regionActivate === resCard.similarCard?.regionActivate) {
                            flag = false
                        }
                    })
                    if (flag) {
                        resultList.push(card)
                    }
                }).filter(el => el !== null)
                if (inputValue === '') {
                    setCardList(null)
                } else {
                    setCardList(resultList.splice(0, 20))
                }
            })
        })
    }

    useEffect(() => {
        if (inputRef.current) {
            setTimeout(() => {
                inputRef.current.click();
            }, 300)
        }
    }, []);

    const handleFocus = () => {
        setIsInputFocused(true);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setIsInputFocused(false);
        }, 100)
    };

    useEffect(() => {
        window.clearTimeout(timerId);
        if (inputValue !== '') {
            timerId = window.setTimeout(() => {
                getCardList().then()
            }, 250)
        } else {
            setCardList(null)
        }
    }, [inputValue])

    return (<div className={style['mainDivision']}>
        <div>
            <div>
                <div/>
                <input placeholder={'Поиск'}
                       onFocus={handleFocus}
                       onBlur={handleBlur}
                       value={inputValue}
                       ref={inputRef}
                       returnKeyType="search"
                       onChange={(event) => {
                           setInputValue(event.target.value)
                           setCardList(null)
                       }}></input>
                <button onClick={() => {
                    setInputValue('');
                    setCardList(null)
                }}>
                    <div/>
                </button>
            </div>
        </div>
        {inputValue !== '' ? (cardList !== null ? (cardList.length > 0 ? (<div className={style['scrollList']}
                                                                               style={{paddingBottom: String(window.innerWidth * 0.20 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom + (window.screen.availHeight - window.innerHeight - (window.screen.availHeight - window.innerHeight > 0) ? window.innerWidth * 0.20 : 0) + 10) + 'px'}}>
            <div className={'list-grid'}>
                {cardList.map(item => {
                    return (<div style={{marginLeft: '6vw'}}>
                        <CatalogItem key={item.id} product={item} isClicked={!isInputFocused}/>
                    </div>)
                })}
            </div>
            <div className={style['helpPlace']}>
                <div> не нашли то, что искали?</div>
                <div> напишите нам, мы поможем</div>
                <button onClick={() => window.open('https://t.me/gwstore_admin')}>написать в поддержку</button>
            </div>
        </div>) : (<div className={style['emptyList']}>
            <div/>
            <div>Нет результатов</div>
            <div>по запросу "{inputValue}"</div>
            <div>ничего не найдено.</div>
            <div>попробуйте другой запрос</div>
            <div>или напишите в поддержку</div>
            <button onClick={() => window.open('https://t.me/gwstore_admin')}>написать в поддержку</button>
        </div>)) : (<div className={style["wrapper"]}>
            <div className={style["circle"]}></div>
            <div className={style["circle"]}></div>
            <div className={style["circle"]}></div>
            <div className={style["shadow"]}></div>
            <div className={style["shadow"]}></div>
            <div className={style["shadow"]}></div>
        </div>)) : (<div>
            <HomeScreen setInputValue={setInputValue}/>
            <div className={style['welcome']}/>
        </div>)}
    </div>);
};

export default Search;