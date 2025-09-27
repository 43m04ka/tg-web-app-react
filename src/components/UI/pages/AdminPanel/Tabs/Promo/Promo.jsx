import React, {useEffect, useState} from 'react';
import {useServer} from "./useServer";
import useData from "../../useData";
import PromoList from "./PromoList";
import BlockLabel from "../../Elements/BlockLabel";
import InputLabel from "../../Elements/InputLabel";
import ButtonLabel from "../../Elements/ButtonLabel";

const Promo = () => {

    const [promoList, setPromoList] = useState(null);
    const [promoId, setPromoId] = useState(-1);
    const {authenticationData} = useData();
    const {getPromoList, createPromo, deletePromo} = useServer()

    const [inputNameCreatePage, setInputNameCreatePage] = useState(null)
    const [inputPercentCreatePage, setInputPercentCreatePage] = useState(null)
    const [inputPersonalNumCreatePage, setInputPersonalNumCreatePage] = useState(null)
    const [inputGlobalNumCreatePage, setInputGlobalNumCreatePage] = useState(null)

    useEffect(() => {
        if(promoList === null) {
            getPromoList(authenticationData, setPromoList).then()
        }
    }, [getPromoList]);

    return (
        <div>
            {promoList !== null
                ?
                (<PromoList promoList={promoList} setPromoId={setPromoId} onReload={()=>{getPromoList(authenticationData, setPromoList).then()}}/>)
                :
                (<div className={'plup-loader'}/>)}
            <BlockLabel label={'Создать промокод'}>
                    <InputLabel onChange={(e) => {
                        setInputNameCreatePage(e.target.value.toUpperCase())
                    }} label={'Имя'} placeholder={'NEWPROMO2025'}/>
                    <InputLabel onChange={(e) => {
                        setInputPercentCreatePage(Number(e.target.value))
                    }} label={'Процент скидки'} placeholder={'3'}/>
                    <InputLabel onChange={(e) => {
                        setInputGlobalNumCreatePage(Number(e.target.value))
                    }} label={'Общее кол-во использований'} placeholder={'1000'}/>
                    <InputLabel onChange={(e) => {
                        setInputPersonalNumCreatePage(Number(e.target.value))
                    }} label={'Персональное кол-во использований'} placeholder={'3'}/>
                    <ButtonLabel label={'Создать страницу'} onClick={async () => {
                        await createPromo(authenticationData, {name: inputNameCreatePage, percent : inputPercentCreatePage, totalNumberUses : inputGlobalNumCreatePage, personalNumberUses : inputPersonalNumCreatePage})
                        setTimeout(await getPromoList(authenticationData, setPromoList).then(), 100)
                    }}/>
            </BlockLabel>
            {promoId !== -1 ? (
                    <BlockLabel label={'Действие'}>
                        <ButtonLabel label={'Удалить'} onClick={async () => {
                            await deletePromo(authenticationData, promoId).then()
                            setTimeout(await getPromoList(authenticationData, setPromoList).then(), 100)
                            setPromoId(-1)
                        }}/>
                    </BlockLabel>)
                : ''}
        </div>
    );
};

export default Promo;





