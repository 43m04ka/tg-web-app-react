import React from 'react';
import style from "../Product.module.scss";
import {useTelegram} from "../../../../../hooks/useTelegram";
import {useServer} from "../useServer";

const ShareLabels = ({productData, parameters}) => {

    const {tg, user} = useTelegram()
    const {prepareShareMessage} = useServer()

    console.log(productData)

    let textMessage = `${productData.name} — ${String(productData.similarCard?.price || productData.price).toLocaleString()} ₽\n`

    let endDatePromotion = '\n'
    let parcent = ''


    if(typeof productData.endDatePromotion !== 'undefined' && productData.endDatePromotion !== null){
        endDatePromotion = `*cкидка ${parcent} действует до ${productData.endDatePromotion} \n\n`
    }

    if (productData.oldPrice !== null) {
        parcent = Math.ceil((1 - productData.price / productData.oldPrice) * 100) + '%'
    } else if (productData.similarCard !== null) {
        if (typeof productData.similarCard.oldPrice !== 'undefined') {
            parcent = Math.ceil((1 - productData.similarCard?.price / productData.similarCard?.oldPrice) * 100) + '%'
        }
        if (typeof productData.similarCard.endDatePromotion !== 'undefined' && productData.similarCard.endDatePromotion !== null) {
            endDatePromotion = `*cкидка ${parcent} действует до ${productData.similarCard?.endDatePromotion} \n\n`
        }
    }
    textMessage += endDatePromotion

    parameters.map((parameter) => {
        if (productData[parameter.key] !== null && productData[parameter.key] !== '') {
            textMessage += `${parameter.label}: ${typeof parameter.key !== 'function' ? productData[parameter.key] : parameter.key(productData)}\n`
        }
    })

    textMessage += '\nКупить можно в приложении Геймворд — https://t.me/gwstore_bot/app?startapp=' + String(productData.id)

    return (
        <div>
            <div className={style['shareLabel']}
                 onClick={async () => {
                     await prepareShareMessage((messageId) => {
                         tg.shareMessage(messageId)
                     }, productData.id, user.id)
                 }}>
                <div className={style['shareLabelShare']}/>
                <p>Поделиться карточкой</p>
            </div>

            <div className={style['shareLabel']}
                 onClick={async ()=>{
                     try {
                         await navigator.clipboard.writeText(textMessage);
                         showToast("Скопировано!");
                     } catch (err) {
                         console.error("Ошибка при копировании", err);
                     }
                 }}>
                <div className={style['shareLabelCopy']}/>
                <p>Скопировать прямую ссылку</p>
            </div>
        </div>
    );
};

export default ShareLabels;