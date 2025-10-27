import React, {useEffect} from 'react';
import style from './Search.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";
import HomeScreen from "./Elements/homeScreen";
import useGlobalData from "../../../../hooks/useGlobalData";
import cardList from "../AdminPanel/Tabs/EditCatalogs/CardList";
import SearchPosition from "./Elements/SearchPosition";

let timerId = -1

const Search = () => {
    const {tg} = useTelegram()
    const {pageId} = useGlobalData()

    const [inputValue, setInputValue] = React.useState('')
    const [cardList, setCardList] = React.useState(null)

    const getCardList = async () => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                method: 'getSearch',
                data: {str: inputValue, pageId: pageId}
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

                setCardList(resultList.splice(0, 20))
            })
        })
    }

    useEffect(() => {
        window.clearTimeout(timerId);
        if (inputValue !== '') {
            timerId = window.setTimeout(() => {
                getCardList().then()
            }, 250)
        }else{
            setCardList([])
        }
    }, [inputValue])

    return (
        <div className={style['mainDivision']}>
            <div>
                <div>
                    <div/>
                    <input placeholder={'Поиск'} value={inputValue} onChange={(event) => {
                        setInputValue(event.target.value)
                    }}></input>
                </div>
            </div>
            {cardList !== null && inputValue !== '' ?
                (<div className={style['scrollList']}>
                    {cardList.map(card => (<SearchPosition data={card}/>))}
                </div>) :
                (<div>
                    <HomeScreen setInputValue={setInputValue}/>
                </div>)}

        </div>
    );
};

export default Search;