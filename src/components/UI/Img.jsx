import React, {useEffect, useState} from 'react';

const Img = ({style, className, url}) => {
    const [url1, setUrl1] = useState('');
    useEffect(() => {
        fetch(url)
            .then(response => response.blob())
            .then((image) => {
                setUrl1(URL.createObjectURL(image));
            });
    });

    if (!url1) {
        return 'animations...';
    }

    return <div style = {style} className={className}></div>;
}

export default Img;