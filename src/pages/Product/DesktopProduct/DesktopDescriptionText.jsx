import React, {useEffect, useRef, useState} from 'react';
import style from "./DesktopDescription.module.scss";

const DesktopDescriptionText = ({productData}) => {
    const [expanded, setExpanded] = useState(false);
    const textRef = useRef(null);
    const [fullHeight, setFullHeight] = useState(0);
    const collapsedHeight = 125;

    useEffect(() => {
        setExpanded(false);
        if (textRef.current) {
            setFullHeight(textRef.current.scrollHeight);
        }
    }, [productData.description]);

    return (
        <section className={style.card}>
            <div
                className={style.descriptionCollapse}
                style={{maxHeight: expanded ? `${fullHeight}px` : `${collapsedHeight}px`}}
            >
                <div
                    ref={textRef}
                    className={style.descriptionText}
                    dangerouslySetInnerHTML={{__html: productData.description}}
                />
            </div>

            {fullHeight > collapsedHeight && (
                <button className={style.seeAll} onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Скрыть описание' : 'Читать полностью'}
                </button>
            )}
        </section>
    );
};

export default DesktopDescriptionText;
