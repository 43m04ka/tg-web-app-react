import {apiFetch} from './client';

const read = async (path, options) => {
    const response = await apiFetch(`/api/review${path}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Не удалось выполнить запрос');
    return data;
};

export const fetchReviews = (page = 1, signal) => read(`?page=${page}`, {signal});
export const fetchReviewOrders = (signal) => read('/mine', {signal});
export const fetchReviewForm = ({orderId, token, signal}) => token
    ? read('/invitation', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token}), signal})
    : read(`/form/${orderId}`, {signal});
export const submitReview = (form, personal) => read(personal ? '/invitation/submit' : '/submit', {method: 'POST', body: form});
