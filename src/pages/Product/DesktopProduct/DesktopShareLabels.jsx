import React, {useState} from 'react';
import {useTelegram} from "../../../hooks/useTelegram";
import {useServerUser} from "../../../hooks/useServerUser";
import {getShareText} from "./productDesktopUtils";
import style from "./DesktopShareLabels.module.scss";
import {usePlatform} from "../../../hooks/utils/usePlatform";
import {usePlatformUser} from "../../../hooks/usePlatformUser";
import {shareProduct} from "../../../shared/lib/shareProduct";

const DesktopShareLabels = ({productData, parameters}) => {
    const {tg} = useTelegram();
    const { user } = usePlatformUser();
    const { isTg } = usePlatform();
    const {prepareShareMessage} = useServerUser();
    const [copied, setCopied] = useState(false);

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(getShareText(productData, parameters, isTg));
            setCopied(true);
            window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('soft');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Ошибка при копировании', error);
        }
    };

    return (
        <section className={style.card}>
            <div className={style.actions}>
                {isTg && (
                    <button onClick={() => shareProduct({
                        tg,
                        prepareShareMessage,
                        productId: productData.id,
                        userId: user.id,
                        fallbackText: getShareText(productData, parameters, isTg)
                    })}>
                        Поделиться карточкой
                    </button>
                )}
                <button
                    className={`${style.shareBtn} ${copied ? style.shareBtnCopied : ''}`}
                    onClick={onCopy}
                >
                    {copied ? 'Ссылка скопирована!' : 'Скопировать прямую ссылку'}
                </button>
            </div>
        </section>
    );
};

export default DesktopShareLabels;
