import { resetEmailCode, ApiError } from '../api/api.js';

const LABELS = {
    run: '인증 초기화',
    running: '초기화 중…',
    success: '이메일 인증을 초기화했습니다',
    notFound: '등록되지 않은 이메일입니다',
};

export function initSpozoneTab() {
    const emailInput = document.getElementById('spozone-email-input');
    const autocompleteList = document.getElementById('email-autocomplete-list');
    const btnReset = document.getElementById('btn-spozone-reset');
    
    // 알림 및 팝업 UI 요소
    const toastContainer = document.getElementById('toast-container');
    const popupOverlay = document.getElementById('error-popup');
    const popupCode = document.getElementById('error-popup-code');
    const btnClosePopup = document.getElementById('btn-close-popup');

    const domains = [
        'gmail.com',
        'naver.com',
        'daum.net',
        'hanmail.net',
        'kakao.com',
        'yahoo.com'
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 로컬스토리지에서 이전에 사용한 이메일 불러오기
    const savedEmail = localStorage.getItem('savedSpozoneEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        if (emailRegex.test(savedEmail)) {
            btnReset.classList.remove('hidden');
        }
    }

    // 자동완성 로직
    emailInput.addEventListener('input', (e) => {
        const value = e.target.value;
        const atIndex = value.indexOf('@');
        
        // 이메일 형식이 유효한지 확인하여 실행 버튼 표시/숨김
        if (emailRegex.test(value)) {
            btnReset.classList.remove('hidden');
        } else {
            btnReset.classList.add('hidden');
        }

        // 자동완성 목록 표시
        if (atIndex !== -1) {
            const prefix = value.substring(0, atIndex);
            const typedDomain = value.substring(atIndex + 1).toLowerCase();
            
            // 사용자가 @ 뒤에 입력한 내용으로 도메인 필터링
            const matchedDomains = domains.filter(domain => domain.startsWith(typedDomain));
            
            if (matchedDomains.length > 0) {
                renderAutocomplete(prefix, matchedDomains);
            } else {
                autocompleteList.classList.add('hidden');
            }
        } else {
            autocompleteList.classList.add('hidden');
        }
    });

    function renderAutocomplete(prefix, matchedDomains) {
        autocompleteList.innerHTML = '';
        
        matchedDomains.forEach(domain => {
            const li = document.createElement('li');
            li.textContent = `${prefix}@${domain}`;
            li.addEventListener('click', () => {
                emailInput.value = `${prefix}@${domain}`;
                autocompleteList.classList.add('hidden');
                btnReset.classList.remove('hidden'); // 유효한 이메일이므로 버튼 표시
                emailInput.focus();
            });
            autocompleteList.appendChild(li);
        });
        
        autocompleteList.classList.remove('hidden');
    }

    // 영역 밖을 클릭하면 자동완성 목록 숨김
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            autocompleteList.classList.add('hidden');
        }
    });

    // 실행 버튼 로직
    btnReset.addEventListener('click', async () => {
        const email = emailInput.value;
        
        // 실행 시 로컬스토리지에 이메일 저장
        localStorage.setItem('savedSpozoneEmail', email);

        // 버튼 로딩 상태 UI 적용
        btnReset.disabled = true;
        btnReset.textContent = LABELS.running;

        try {
            // STG API 직접 호출 (api.js 의 resetEmailCode 사용)
            const isReset = await resetEmailCode(email);
            // true: 초기화 성공 / false: 등록되지 않은 이메일
            showToast(isReset ? LABELS.success : LABELS.notFound);
        } catch (error) {
            if (error instanceof TypeError) {
                // 네트워크 끊김, 회사 네트워크 밖에서 접속, 또는 서버 CORS 미허용
                showErrorPopup('Network/CORS Error', error.message);
            } else if (error instanceof ApiError) {
                // 서버가 에러 상태 코드를 응답했거나 응답 형식이 이상한 경우
                showErrorPopup(error.status, error.message);
            } else {
                showErrorPopup('Error', error?.message ?? '알 수 없는 오류');
            }
        } finally {
            btnReset.disabled = false;
            btnReset.textContent = LABELS.run;
        }
    });

    // 토스트 알림 기능
    function showToast(message) {
        toastContainer.textContent = message;
        toastContainer.classList.remove('hidden');
        
        // 3초 뒤에 토스트 숨김
        setTimeout(() => {
            toastContainer.classList.add('hidden');
        }, 3000);
    }

    // 에러 팝업 띄우기 기능
    function showErrorPopup(code, message) {
        const codeEl = Object.assign(document.createElement('span'), { className: 'popup-code', textContent: `Code ${code}` });
        popupCode.replaceChildren(codeEl, message ?? '');
        popupOverlay.classList.remove('hidden');
    }

    btnClosePopup.addEventListener('click', () => {
        popupOverlay.classList.add('hidden');
    });
}
