export const API_CONFIG = {
    staging4: 'https://stg4.spotvnow.co.kr/api/v3/game/type',
    product: 'https://www.spotvnow.co.kr/api/v3/game/type'
};

/**
 * Fetches game types based on the selected server
 * @param {string} server - 'staging4' or 'product'
 * @returns {Promise<Array>} Array of game type objects
 */
export async function fetchGameTypes(server) {
    const url = API_CONFIG[server];
    if (!url) throw new Error('알 수 없는 서버입니다.');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API 통신 에러: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw new Error('데이터를 가져오는데 실패했어요. (CORS 문제일 수도 있어요 😢)');
    }
}
