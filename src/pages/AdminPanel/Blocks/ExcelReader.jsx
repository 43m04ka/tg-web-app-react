import React from 'react';
import styles from './ExcelReader.module.scss'

const SheetJSFT = [
    "xlsx", "xls"
].map(function (x) {
    return "." + x;
}).join(",");

const ExcelReader = ({setButtonTable}) => {

    const [text, setText] = React.useState('Файл не выбран');
    const [error, setError] = React.useState('');

    const handleChange = (e) => {
        const files = e.target.files;
        setError('');

        if (files && files[0]) {
            const fileName = e.target.value.replace('C:\\fakepath\\', '');
            setText(fileName);

            // Проверка расширения файла
            const validExtensions = ['.xlsx', '.xls'];
            const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

            if (!validExtensions.includes(fileExtension)) {
                setError('❌ Неверный формат. Выберите .xlsx или .xls');
                return;
            }

            // Проверка размера (50 МБ)
            const maxSize = 50 * 1024 * 1024; // 50 МБ
            if (files[0].size > maxSize) {
                const sizeMB = (files[0].size / (1024 * 1024)).toFixed(2);
                setError(`❌ Файл ${sizeMB}МБ слишком большой. Максимум 50 МБ`);
                return;
            }

            // Передаем файл напрямую, парсинг произойдет на сервере
            setButtonTable({file: files[0]});
        }
    };

    return (
        <div style={{marginLeft: '7px'}}>
            <label className={styles["input-file"]}>
                <input 
                    type="file" 
                    id="file" 
                    className={'text-element'}
                    style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px'}} 
                    accept={SheetJSFT}
                    onChange={handleChange}
                />
                <div className={styles["input-file-btn"]}>Выберите файл</div>
                <div className={styles["input-file-text"]}>{text}</div>
            </label>
            {error && (
                <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#3a2a2a',
                    border: '1px solid #ff6b6b',
                    borderRadius: '4px',
                    color: '#ff6b6b',
                    fontSize: '12px'
                }}>
                    {error}
                </div>
            )}
        </div>
    )
}

export default ExcelReader;
