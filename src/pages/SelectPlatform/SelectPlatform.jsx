import React, {useCallback, useEffect, useRef} from 'react';
import style from './SelectPlatform.module.scss';
import useGlobalData from '../../hooks/useGlobalData';
import {useNavigate} from 'react-router-dom';
import {useTelegram} from '../../hooks/useTelegram';
import {useIsDesktopMedia} from '../../hooks/useIsDesktopMedia';
import PlatformCard from './Elements/PlatformCard';
import SelectPlatformHeader from './Elements/SelectPlatformText';
import SelectPlatformLink from './Elements/SelectPlatformLink';
import {usePlatform} from "../../hooks/utils/usePlatform";
import {useAppInsets} from "../../hooks/useAppInsets";

const SelectPlatform = () => {
    const {pageList, pageId, setPageId, updateBasket, catalogList, setBarIsVisible, startPageList, updateStartPageList} = useGlobalData();
    const navigate = useNavigate();
    const { tg } = useTelegram();
const { safeAreaInset, contentSafeAreaInset, isKeyboardOpen } = useAppInsets();

    const { botType } = usePlatform();
    useIsDesktopMedia();
    const selectingRef = useRef(false);


    useEffect(() => {
        tg.BackButton.hide();
    }, [tg]);

    // Данных может не быть, если сервер не вложил их в index.html, а фоновый
    // запрос оборвался — без этого экран остаётся с одним заголовком
    const retriedRef = useRef(false);
    useEffect(() => {
        if (startPageList.length > 0 || retriedRef.current) return;
        retriedRef.current = true;
        updateStartPageList();
    }, [startPageList, updateStartPageList]);

    const handleSelect = useCallback((item) => {
        if (selectingRef.current) {
            return;
        }

        console.log(item)

        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');

        if (item.id !== pageId) {
            setPageId(item.id);
            updateBasket(catalogList, item.id);
        }

        setTimeout(()=>{
            setBarIsVisible(true);
            navigate('/main/catalogs');  
        }, 300)
    }, [catalogList, pageId, setPageId, updateBasket]);


    if (!pageList?.length) {
        return null;
    }

    console.log(pageList)

    return (
        <div className={style.container}style={{paddingTop: String(safeAreaInset.top + contentSafeAreaInset.top + window.innerWidth * 0.05) + 'px', 
            paddingBottom: String(safeAreaInset.top + contentSafeAreaInset.top + window.innerWidth * 0.05) + 'px'
        }}>
            <h className={style.introText}>
                Геймворд — ваш сервис для покупки игр и подписок для 
                <a> PlayStation</a> и 
                <a> Xbox</a>
            </h>
            {([...startPageList].sort((a, b) => a.serialNumber - b.serialNumber)).map((item, index) => {
                if(item.platform === botType){
                    if(item.type === 'page'){
                        return(<PlatformCard
                            key={item.id}
                            item={{...pageList.find(user => user.id === item.structurePageId), ...item}}
                            isActive={item.structurePageId === pageId}
                            animationDelay={`${index * 0.08}s`}
                            onSelect={() => handleSelect(pageList.find(user => user.id === item.structurePageId))}
                        />)
                    }else if(item.type === 'link'){
                        return(<SelectPlatformLink item={item} animationDelay={'0s'}/>)
                    }else{
                        return(<SelectPlatformHeader data={item}/>)
                    }
                }
            })}
        </div>
    );
};

export default SelectPlatform;
