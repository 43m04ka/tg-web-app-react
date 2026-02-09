import { useState, useCallback } from 'react';

const API_BASE = '/api/hosting';

export const useHosting = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPath, setCurrentPath] = useState('');

    const clearError = () => setError(null);

    const fetchContents = useCallback(async (path = '') => {
        setLoading(true);
        clearError();
        try {
            const response = await fetch(`${API_BASE}/list?path=${path}`);
            if (!response.ok) throw new Error('Не удалось прочитать директорию');
            const data = await response.json();
            setItems(data);
            setCurrentPath(path);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadFiles = async (fileList, folder = '') => {
        setLoading(true);
        clearError();

        const formData = new FormData();

        formData.append('folder', folder);

        const filesArray = Array.from(fileList);
        filesArray.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Ошибка загрузки');
            }

            await fetchContents(folder);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (path, type = 'file') => {
        clearError();
        const endpoint = type === 'folder' ? 'folder' : 'file';
        const bodyKey = type === 'folder' ? 'folderPath' : 'filePath';

        try {
            const response = await fetch(`${API_BASE}/${endpoint}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [bodyKey]: path }),
            });

            if (!response.ok) throw new Error('Ошибка при удалении');

            await fetchContents(currentPath);
        } catch (err) {
            setError(err.message);
        }
    };

    const createFolder = async (folderName, parentPath = '') => {
        try {
            const response = await fetch(`${API_BASE}/folder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // ОБЯЗАТЕЛЬНО
                },
                body: JSON.stringify({ folderName, parentPath }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при создании папки');
            }

            await fetchContents(parentPath);
        } catch (err) {
            setError(err.message);
        }
    };

    return { items, loading, error, currentPath, fetchContents, uploadFiles, deleteItem, clearError, createFolder};
};