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
        btnReset.textContent = '⏳ 실행 중...';

        try {
            const response = await fetch('https://stg.spotvnow.jp/api/v2/emailCodes/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                // 상태 코드와 메시지를 포함하는 에러 객체 생성 후 던지기
                throw { status: response.status, message: 'API 응답 에러' };
            }

            const data = await response.json();
            
            if (data === true) {
                showToast('✅ 초기화 성공!');
                // 성공 시 입력창 초기화 (선택 사항: 로컬스토리지는 유지됨)
                // emailInput.value = ''; 
                // btnReset.classList.add('hidden');
            } else if (data === false) {
                showToast('없는 이메일');
            } else {
                throw { status: 'Parsing Error', message: '알 수 없는 응답 형식' };
            }
        } catch (error) {
            // 네트워크/CORS 에러 (TypeError: Failed to fetch) 처리
            if (error instanceof TypeError) {
                showErrorPopup('Network/CORS Error', error.message);
            } else if (error.status) {
                showErrorPopup(error.status, error.message);
            } else {
                showErrorPopup('Error', error.message || '알 수 없는 오류');
            }
        } finally {
            btnReset.disabled = false;
            btnReset.textContent = '🚀 실행';
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
        popupCode.innerHTML = `<span style="color:red">Code: ${code}</span><br><span style="font-size:14px; color:#555;">${message}</span>`;
        popupOverlay.classList.remove('hidden');
    }

    btnClosePopup.addEventListener('click', () => {
        popupOverlay.classList.add('hidden');
    });
}
