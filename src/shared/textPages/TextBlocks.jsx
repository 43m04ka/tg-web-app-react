import React, {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {embedUrl, isInternalLink, parseInline, parseText, safeLink} from './richText';
import style from './TextBlocks.module.scss';

function useLinkProps() {
    const navigate = useNavigate();

    return (href) => (isInternalLink(href)
        ? {
            href,
            onClick: (event) => {
                event.preventDefault();
                navigate(href);
            }
        }
        : {href, target: '_blank', rel: 'noopener noreferrer'});
}

function Inline({tokens, linkProps}) {
    return tokens.map((token, index) => {
        if (token.type === 'bold') {
            return <strong key={index}><Inline tokens={token.children} linkProps={linkProps}/></strong>;
        }

        if (token.type === 'link') {
            return <a key={index} className={style.link} {...linkProps(token.href)}>{token.value}</a>;
        }

        return <React.Fragment key={index}>{token.value}</React.Fragment>;
    });
}

function RichText({text, linkProps}) {
    const parts = useMemo(() => parseText(text), [text]);

    return parts.map((part, index) => {
        if (part.kind === 'ul') {
            return (
                <ul key={index} className={style.list}>
                    {part.items.map((item, itemIndex) => (
                        <li key={itemIndex}><Inline tokens={parseInline(item.text)} linkProps={linkProps}/></li>
                    ))}
                </ul>
            );
        }

        if (part.kind === 'ol') {
            return (
                <ol key={index} className={style.list} start={part.items[0].number}>
                    {part.items.map((item, itemIndex) => (
                        <li key={itemIndex} value={item.number}>
                            <Inline tokens={parseInline(item.text)} linkProps={linkProps}/>
                        </li>
                    ))}
                </ol>
            );
        }

        return (
            <p key={index} className={style.paragraph}>
                {part.lines.map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                        {lineIndex > 0 ? <br/> : null}
                        <Inline tokens={parseInline(line)} linkProps={linkProps}/>
                    </React.Fragment>
                ))}
            </p>
        );
    });
}

function Block({block, linkProps}) {
    if (block.type === 'heading') {
        return block.level === 3
            ? <h3 className={style.subheading}>{block.text}</h3>
            : <h2 className={style.heading}>{block.text}</h2>;
    }

    if (block.type === 'text') {
        return <div className={style.text}><RichText text={block.text} linkProps={linkProps}/></div>;
    }

    if (block.type === 'note') {
        return <div className={style.note}><RichText text={block.text} linkProps={linkProps}/></div>;
    }

    if (block.type === 'image') {
        const src = safeLink(block.src);
        if (!src) return null;

        return (
            <figure className={style.figure}>
                <img className={style.image} src={src} alt={block.caption || ''} loading="lazy"/>
                {block.caption ? <figcaption className={style.caption}>{block.caption}</figcaption> : null}
            </figure>
        );
    }

    if (block.type === 'gallery') {
        return (
            <div className={style.gallery}>
                {(block.images || []).map(safeLink).filter(Boolean).map((src) => (
                    <a key={src} className={style.shot} href={src} target="_blank" rel="noopener noreferrer">
                        <img src={src} alt="" loading="lazy"/>
                    </a>
                ))}
            </div>
        );
    }

    if (block.type === 'video') {
        const src = embedUrl(block.url);
        if (!src) return null;

        return (
            <div className={style.video}>
                <iframe src={src} title="Видео" loading="lazy" allowFullScreen/>
            </div>
        );
    }

    if (block.type === 'buttons') {
        return (
            <div className={style.buttons}>
                {(block.items || []).filter((item) => safeLink(item.href)).map((item) => (
                    <a key={`${item.label}:${item.href}`} className={style.button} {...linkProps(safeLink(item.href))}>
                        {item.label}
                    </a>
                ))}
            </div>
        );
    }

    if (block.type === 'faq') {
        return (
            <div className={style.faq}>
                {(block.items || []).map((item, index) => (
                    <details key={index} className={style.question}>
                        <summary className={style.summary}>
                            <span>{item.question}</span>
                            <i className={style.chevron} aria-hidden="true"/>
                        </summary>
                        <div className={style.answer}><RichText text={item.answer} linkProps={linkProps}/></div>
                    </details>
                ))}
            </div>
        );
    }

    return null;
}

export default function TextBlocks({blocks}) {
    const linkProps = useLinkProps();

    return (
        <div className={style.blocks}>
            {(blocks || []).map((block, index) => <Block key={index} block={block} linkProps={linkProps}/>)}
        </div>
    );
}
