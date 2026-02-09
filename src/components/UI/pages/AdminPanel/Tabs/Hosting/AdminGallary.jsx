import React, {useEffect, useState} from 'react';
import {useHosting} from '../../../../../../hooks/useHosting';
import CopyButton from "./CopyButton";

const srcIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAACIElEQVR4nO3Zz4tNYRjA8ReLW35MTSiJFREbUaNsFJFILFhY2VA2fhTJgqJQk5WNhY2FjWRDMrGZnR+lJCWR2BnKQgZh8NGZc25utzvjnnvvuXPeut8/4Dnn2/u87/M+zxtCjx7xgEUhdrARIyFWMANn8BtCjGA+7qkhxAbW412tRFQimIYj+FkvEY0I5mKokUA0IhjA28kkSi3iXyr9+J9EaUXQhxvNCJRWBGvwOo9E6URwEN+1xpfsWH6BYVzGcWzC7G6m0nXFMYbHOImlRUmswkvd5T52YXqnJPbjm6njFXa0IzALV5WHodytAJbjmfLxEdvziKzEc+XkD47GnFr1nMubZnvxVTk50crxm5weZUyz3Xll5uCa8jGKZblkOnBFKYoHLRXOrP9408IHZ2IhVmAddiZ5jit41OZePJBbJJPpx608X2oiZgUbcB5PWqgxfe00Vscm6tHzijSIvxqX8KlJmdMtiXSr1ZWu/mATd75kVSrtyszD3SJEqmBx/aysAXtCuyQnB07hVxEiNel8eJI5wXDoFNmGHSlCpAo24/MERXJJ6BRYkLWzhYgkYG1WEOs5FAoYYp8tcoiNrVmbXMvtIp8V3hcSPIzHT/Zl/ZCjEt1Dj3TlH9bJDIQYkRbP8RTO2BdiBTdrRC6GWMGWGpE7IVakxbLaAD4NMYMLmciHEDPYlomMhpiRXl4TxkLsSK/9/VP9Hz169Ajd4S9NrFjqtn2SUAAAAABJRU5ErkJggg=='

const AdminGallery = () => {
    const {
        items, loading, error, currentPath,
        fetchContents, uploadFiles, createFolder, deleteItem, clearError
    } = useHosting();

    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        fetchContents('');
    }, [fetchContents]);

    const handleUpload = async (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles.length > 0) {
            await uploadFiles(selectedFiles, currentPath);
            e.target.value = null;
        }
    };


    const handleCreateFolder = () => {
        if (newFolderName) {
            createFolder(newFolderName, currentPath);
            setNewFolderName('');
        }
    };

    const goBack = () => {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        fetchContents(parts.join('/'));
    };

    return (
        <div style={{
            padding: '40px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#e0e0e0',
            backgroundColor: '#0f1117',
            minHeight: '100vh',
            width: 'auto',
            marginLeft: '0',
            marginRight: '0',
        }}>
            <h1 style={{fontSize: '28px', fontWeight: '600', marginBottom: '30px', letterSpacing: '-0.5px'}}>
                Хостинг
            </h1>

            {/* Блок ошибок */}
            {error && (
                <div style={{
                    background: 'rgba(255, 59, 48, 0.1)',
                    border: '1px solid #ff3b30',
                    color: '#ff453a',
                    padding: '12px 20px',
                    marginBottom: '25px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)'
                }}>
                    <span><strong style={{marginRight: '8px'}}>⚠</strong> {error}</span>
                    <button onClick={clearError} style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff453a',
                        cursor: 'pointer',
                        fontSize: '18px'
                    }}>✕
                    </button>
                </div>
            )}

            {/* Панель управления */}
            <div style={{marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center'}}>
                <input type="file" onChange={handleUpload} disabled={loading} id="upload" hidden multiple/>
                <label htmlFor="upload" style={{
                    cursor: 'pointer',
                    padding: '10px 15px',
                    background: '#007aff',
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(0, 122, 255, 0.3)'
                }}>
                    {loading ? 'Загрузка...' : '⬆ Загрузить файл'}
                </label>

                <div style={{
                    display: 'flex',
                    background: '#1c1c1e',
                    padding: '4px',
                    borderRadius: '12px',
                    border: '1px solid #2c2c2e'
                }}>
                    <input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Новая папка"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            padding: '8px 15px',
                            outline: 'none'
                        }}
                    />
                    <button onClick={handleCreateFolder} style={{
                        padding: '8px 16px',
                        background: '#2c2c2e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}>+ Создать
                    </button>
                </div>
            </div>

            {/* Навигация */}
            <div style={{
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#8e8e93'
            }}>
                <span style={{marginRight: '10px'}}>Путь:</span>
                <code style={{background: '#1c1c1e', padding: '4px 10px', borderRadius: '6px', color: '#0a84ff'}}>
                    /data/{currentPath || ''}
                </code>
                {currentPath && (
                    <button onClick={goBack} style={{
                        marginLeft: '15px',
                        background: 'none',
                        border: '1px solid #3a3a3c',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <img
                            src={srcIcon}
                            style={{
                                width: '16px',
                                height: '16px',
                                opacity: '0.8'
                            }}
                        />
                        <p style={{ margin: 0 }}>Назад</p>
                    </button>
                )}
            </div>

            {/* Сетка элементов */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '20px'
            }}>
                {items.map((item) => (
                    <div key={item.path} style={{
                        background: '#1c1c1e',
                        border: '1px solid #2c2c2e',
                        padding: '20px',
                        textAlign: 'center',
                        position: 'relative',
                        borderRadius: '16px',
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                        cursor: 'default'
                    }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.borderColor = '#3a3a3c';
                             e.currentTarget.style.transform = 'translateY(-3px)';
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.borderColor = '#2c2c2e';
                             e.currentTarget.style.transform = 'translateY(0)';
                         }}
                    >
                        {item.type === 'folder' ? (
                            <div onClick={() => fetchContents(item.path)} style={{cursor: 'pointer'}}>
                                <div style={{fontSize: '48px', marginBottom: '10px'}}>📁</div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#fff',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>{item.name}</div>
                            </div>
                        ) : (
                            <div>
                                <img
                                    src={item.url}
                                    alt={item.name}
                                    style={{
                                        width: '100%',
                                        height: '110px',
                                        objectFit: 'cover',
                                        borderRadius: '10px',
                                        marginBottom: '12px',
                                        background: '#2c2c2e'
                                    }}
                                />
                                <div style={{
                                    fontSize: '13px',
                                    color: '#8e8e93',
                                    marginBottom: '12px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {item.name}
                                </div>
                                <CopyButton url={item.url}/>
                            </div>
                        )}

                        <button
                            onClick={() => window.confirm('Удалить?') && deleteItem(item.path, item.type)}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(255, 69, 58, 0.1)',
                                color: '#ff453a',
                                border: 'none',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {!loading && items.length === 0 && (
                <div style={{textAlign: 'center', marginTop: '100px', color: '#48484a'}}>
                    <div style={{fontSize: '50px'}}>📂</div>
                    <p>Папка пуста</p>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;