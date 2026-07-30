import {API_BASE_URL} from "./baseUrl";
import useGlobalData from "../useGlobalData";

export function steamRoute(){

    const getSteamQuote = async (amount) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/steam/quote?amount=${amount}&time=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting steam quote:', error);
            return { error: error.message };
        }
    }

    const createSteamOrder = async (steamInput, setResult) => {
        const actualUserId = useGlobalData.getState().internalUserId;

        const bodyData = {
            userId: actualUserId,
            platform: steamInput.platform,
            contact: steamInput.contact,
            username: steamInput.username,
            steamLogin: steamInput.steamLogin,
            email: steamInput.email,
            amount: steamInput.amount,
        };

        fetch(`${API_BASE_URL}/api/steam/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(bodyData),
        }).then(async response => {
            const data = await response.json();
            setResult({...data, ok: response.ok});
        })
    }

    return {getSteamQuote, createSteamOrder}
}
