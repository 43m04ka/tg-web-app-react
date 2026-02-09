import { useState, useEffect, useCallback } from 'react';


const useDictionaryItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/processList?time=' + new Date());
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 1000);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    const updateNotificationStatus = async (id, notification) => {
        try {
            const response = await fetch(`/api/admin/setNotificationProcess/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notification: notification }),
            });

            if (!response.ok) throw new Error(`Failed to update status`);



        } catch (err) {
            console.error("Ошибка при обновлении статуса нотификации:", err);
        }
    };

    return { items, loading, error, updateNotificationStatus };
};

export default useDictionaryItems;
