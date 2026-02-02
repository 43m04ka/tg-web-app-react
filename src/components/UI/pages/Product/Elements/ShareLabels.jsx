import React, {useState} from 'react';
import style from "../Product.module.scss";
import {useTelegram} from "../../../../../hooks/useTelegram";
import {useServerUser} from "../../../../../hooks/useServerUser";

const ShareLabels = ({productData, parameters}) => {

    const {tg, user} = useTelegram()
    const {prepareShareMessage} = useServerUser()
    const [copied, setCopied] = useState(false);

    let textMessage = `${productData.name} — ${String(productData.similarCard?.price || productData.price).toLocaleString()} ₽\n`


    let endDatePromotion = ''
    let percent = ''

    if (productData.oldPrice !== null) {
        percent = '-' + Math.ceil((1 - productData.price / productData.oldPrice) * 100) + '%'

        if (productData.endDatePromotion !== null) {
            if (!Number.isNaN(Number(productData.endDatePromotion)) && productData.endDatePromotion.trim() !== "") {
                endDatePromotion = `*cкидка ${percent} действует до ${(new Date(Number(productData.endDatePromotion))).toLocaleDateString('ru-RU')} \n\n`
            } else {
                endDatePromotion = `*cкидка ${percent} действует до ${productData.endDatePromotion} \n\n`
            }
        }

    } else if (productData.similarCard !== null) {
        if (typeof productData.similarCard.oldPrice !== 'undefined') {
            percent = '-' + Math.ceil((1 - productData.similarCard?.price / productData.similarCard?.oldPrice) * 100) + '%'
        }
        if (typeof productData.similarCard.endDatePromotion !== 'undefined') {
            if (!Number.isNaN(Number(productData.similarCard?.endDatePromotion)) && productData.similarCard?.endDatePromotion.trim() !== "") {
                endDatePromotion = `*cкидка ${percent} действует до ${(new Date(Number(productData.similarCard?.endDatePromotion))).toLocaleDateString('ru-RU')} \n\n`
            } else {
                endDatePromotion = `*cкидка ${percent} действует до ${productData.similarCard?.endDatePromotion} \n\n`
            }
        }
    }

    textMessage += endDatePromotion

    parameters.map((parameter) => {
        if (productData[parameter.key] !== null && productData[parameter.key] !== '') {
            textMessage += `${parameter.label}: ${typeof parameter.key !== 'function' ? productData[parameter.key] : parameter.key(productData)}\n`
        }
    })

    textMessage += '\nКупить можно в приложении Геймворд — https://t.me/gwstore_bot/app?startapp=' + String(productData.id)

    return (<div>
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
             onClick={async () => {
                 try {
                     await navigator.clipboard.writeText(textMessage);
                     setCopied(true);
                     window.Telegram.WebApp.HapticFeedback.impactOccurred('soft');
                     setTimeout(() => setCopied(false), 2000);
                 } catch (err) {
                     console.error("Ошибка при копировании", err);
                 }
             }}>
            <div className={style['shareLabelCopy']}/>
            <p>Скопировать прямую ссылку</p>
        </div>
        {copied ? (<div style={{
            top: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top + 20) + 'px',
        }} className={style['copyNotify']}>
            <div className={style['shareLabelCopy']}/>
            <p>
                Ссылка скопирована в буфер обмена
            </p>
        </div>) : ''}
    </div>);
};

export default ShareLabels;