import React, {useEffect, useState} from 'react';
import {useServer} from "../../../hooks/useServer";
import HomeBlock from "../HomeBlock";

const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'


let lastPageID = -1
const MpCatalogs = ({pageId}) => {
    console.log(lastPageID)
    const {getCatalogs} = useServer()
    const [data, setData] = useState([]);
    const [cardList, setCardList] = useState([]);

    useEffect(() => {
            getCatalogs(pageId, 'body', setData)
            fetch(URL + '/getPreviewCards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            }).then(async response => {
                let answer = response.json()
                answer.then((data) => {
                    setCardList(data.result)
                })
            })
    }, [])

    if (lastPageID !== pageId) {
        lastPageID = pageId;
        getCatalogs(pageId, 'body', setData).then()

    }

    if (data.length > 0) {
        return (<div>
                {data.map((cat) => {
                    let cardArray = []
                    cardList.map(card => {
                        let flag = false
                        card.category.map(el => {
                            if (el === cat.path) {
                                flag = true
                            }
                        })
                        if (flag) {
                            cardArray.push(card)
                        }
                    })
                    let newDataCat = cat
                    newDataCat.body = cardArray
                    return (<HomeBlock data={newDataCat}/>)
                })}
            </div>
        )
    } else {
        return (
            <div>
                <div style={{display: 'flex', flexDirection: 'column', marginTop: '20px'}}>
                    <div>
                        <div style={{
                            width: String(window.innerWidth / 2) + 'px',
                            height: '25px',
                            background: '#373737',
                            borderRadius: '7px',
                            marginLeft: '20px'
                        }}/>
                        <div style={{marginTop: '20px', display: 'flex', flexDirection: 'row'}}>
                            <div>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '5px'
                                }}/>
                                <div style={{
                                    width: '70px',
                                    height: '10px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '5px',
                                    marginTop: '10px'
                                }}/>
                                <div style={{
                                    width: '85px',
                                    height: '10px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '5px',
                                    marginTop: '3px'
                                }}/>
                            </div>
                            <div>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px'
                                }}/>
                                <div style={{
                                    width: '70px',
                                    height: '10px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px',
                                    marginTop: '10px'
                                }}/>
                                <div style={{
                                    width: '85px',
                                    height: '10px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px',
                                    marginTop: '3px'
                                }}/>
                            </div>
                            <div>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px'
                                }}/>
                                <div style={{
                                    width: '70px',
                                    height: '10px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px',
                                    marginTop: '10px'
                                }}/>
                                <div style={{
                                    width: '85px',
                                    height: '10px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px',
                                    marginTop: '3px'
                                }}/>
                            </div>
                            <div>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px'
                                }}/>
                                <div style={{
                                    width: '70px',
                                    height: '10px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px',
                                    marginTop: '10px'
                                }}/>
                                <div style={{
                                    width: '85px',
                                    height: '10px',
                                    background: '#373737',
                                    borderRadius: '7px',
                                    marginLeft: '10px',
                                    marginTop: '3px'
                                }}/>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        width: '100px',
                        height: '25px',
                        background: '#373737',
                        borderRadius: '7px',
                        marginLeft: String(window.innerWidth / 2 - 50) + 'px',
                        marginTop: '10px'
                    }}/>
                </div>
            </div>
        );
    }
};

export default MpCatalogs;