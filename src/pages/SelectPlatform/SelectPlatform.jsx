import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import style from './SelectPlatform.module.scss';
import useGlobalData from '../../hooks/useGlobalData';
import {useNavigate} from 'react-router-dom';
import {useTelegram} from '../../hooks/useTelegram';
import {useIsDesktopMedia} from '../../hooks/useIsDesktopMedia';
import PlatformCard from './Elements/PlatformCard';
import SelectPlatformHeader from './Elements/SelectPlatformText';
import SelectPlatformLink from './Elements/SelectPlatformLink';

const SelectPlatform = () => {
    const {pageList, pageId, setPageId, updateBasket, catalogList, setBarIsVisible, startPageList} = useGlobalData();
    const navigate = useNavigate();
    const {tg, safeAreaInset, contentSafeAreaInset, botType} = useTelegram();
    const isDesktop = useIsDesktopMedia();
    const selectingRef = useRef(false);

    useEffect(() => {
        tg.BackButton.hide();
    }, [tg]);

    const handleSelect = useCallback((item) => {
        if (selectingRef.current) {
            return;
        }

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

    return (
        <div className={style.container}style={{paddingTop: String(safeAreaInset.top + contentSafeAreaInset.top) + 'px'}}>
            {(startPageList.sort((a, b) => a.serialNumber - b.serialNumber)).map((item, index) => {
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
