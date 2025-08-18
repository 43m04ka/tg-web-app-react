import React, {useState} from 'react';
import useData from "../../useData";
import BlockLabel from "../../Elements/BlockLabel";
import InputLabel from "../../Elements/InputLabel";
import ButtonLabel from "../../Elements/ButtonLabel";
import cardList from "../EditCatalogs/CardList";
import {useServer} from "./useServer";

const CreateCard = ({onReload}) => {

    const {authenticationData} = useData()
    const {createExchangeIndiaCard} = useServer()

    const [newCardData, setNewCardData] = useState({})

    return (
        <div>
            <BlockLabel label={'Создать карту'}>
                <InputLabel onChange={(e) => {
                    let newObj = newCardData
                    newObj.name = e.target.value
                    setNewCardData(newObj)
                }} label={'Имя'} placeholder={'1000 RS'}/>
                <InputLabel onChange={(e) => {
                    let newObj = newCardData
                    newObj.price = e.target.value
                    setNewCardData(newObj)
                }} label={'Стоимость в рублях'} placeholder={'2500'}/>
                <InputLabel onChange={(e) => {
                    let newObj = newCardData
                    newObj.priceInOtherCurrency = e.target.value
                    setNewCardData(newObj)
                }} label={'Ценность в другой валюте'} placeholder={'1000'}/>
                <InputLabel onChange={(e) => {
                    let newObj = newCardData
                    newObj.image = e.target.value
                    setNewCardData(newObj)
                }} label={'Изображение'} placeholder={'https://i.postimg.cc...'}/>
                <ButtonLabel label={'Создать карту'} onClick={() => {
                    createExchangeIndiaCard(onReload, authenticationData, newCardData).then()
                }}/>
            </BlockLabel>
        </div>
    );
};

export default CreateCard;