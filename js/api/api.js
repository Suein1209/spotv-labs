export const API_CONFIG = {
    staging4: 'https://stg4.spotvnow.co.kr/api/v3/game/type',
    product: 'https://www.spotvnow.co.kr/api/v3/game/type'
};

// Spozone(STG) 이메일 인증 초기화 API
// ⚠️ STG 서버는 회사 네트워크에서만 접속되고, CORS 허용 목록에 GitHub Pages 주소가 있어야 브라우저에서 호출된다.
export const SPOZONE_CONFIG = {
    resetUrl: 'https://stg.spotvnow.jp/api/v2/emailCodes/reset',
};

/**
 * API 가 정상 응답하지 않았을 때 던지는 에러
 * - status: HTTP 상태 코드 또는 에러 종류 문자열
 */
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/**
 * Spozone(STG) 계정의 이메일 인증 상태를 초기화합니다.
 * @param {string} email - 초기화할 이메일
 * @returns {Promise<boolean>} true: 초기화 성공 / false: 등록되지 않은 이메일
 * @throws {TypeError} 네트워크 실패 또는 CORS 차단 (브라우저는 두 경우를 구분하지 않음)
 * @throws {ApiError} 서버 에러 응답 또는 예상하지 못한 응답 형식
 */
export async function resetEmailCode(email) {
    const response = await fetch(SPOZONE_CONFIG.resetUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        // 서버가 내려준 에러 메시지가 있으면 그대로 사용
        const body = await response.json().catch(() => null);
        throw new ApiError(response.status, body?.message ?? 'API 응답 에러');
    }

    // 정상 응답은 순수한 true / false 값
    const data = await response.json().catch(() => null);
    if (typeof data !== 'boolean') {
        throw new ApiError('Parsing Error', '알 수 없는 응답 형식');
    }
    return data;
}

/**
 * 선택된 서버에 기반하여 게임 타입 목록을 가져옵니다.
 * @param {string} server - 'staging4' 또는 'product'
 * @returns {Promise<Array>} 게임 타입 객체들의 배열
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
