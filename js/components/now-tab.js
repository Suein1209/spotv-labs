import { fetchGameTypes } from '../api/api.js';

export function initNowTab() {
    const btnServerSelect = document.getElementById('btn-server-select');
    const serverList = document.getElementById('server-list');
    const btnGametypeSelect = document.getElementById('btn-gametype-select');
    const gametypeList = document.getElementById('gametype-list');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const deeplinkPanel = document.getElementById('deeplink-panel');
    const deeplinkUrlEl = document.getElementById('deeplink-url');
    const btnExecuteDeeplink = document.getElementById('btn-execute-deeplink');

    let currentServer = '';
    let currentGame = null;

    // 서버 드롭다운 열기/닫기
    btnServerSelect.addEventListener('click', () => {
        serverList.classList.toggle('hidden');
        gametypeList.classList.add('hidden'); // 다른 드롭다운 닫기
    });

    // 서버 선택
    serverList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            currentServer = e.target.getAttribute('data-value');
            btnServerSelect.textContent = e.target.textContent + ' ▾';
            serverList.classList.add('hidden');
            
            // 서버가 변경될 때 게임 타입 초기화
            btnGametypeSelect.textContent = '게임 타입 ▾';
            gametypeList.innerHTML = '';
            currentGame = null;
            deeplinkPanel.classList.add('hidden');
        }
    });

    // 게임타입 드롭다운 열기/닫기 및 데이터 가져오기
    btnGametypeSelect.addEventListener('click', async () => {
        serverList.classList.add('hidden'); // 다른 드롭다운 닫기
        
        const isHidden = gametypeList.classList.contains('hidden');
        if (!isHidden) {
            gametypeList.classList.add('hidden');
            return;
        }

        if (!currentServer) {
            alert('서버를 먼저 선택해주세요!');
            return;
        }

        // 목록이 비어있다면 데이터 가져오기
        if (gametypeList.children.length === 0) {
            try {
                errorEl.classList.add('hidden');
                loadingEl.classList.remove('hidden');
                
                const data = await fetchGameTypes(currentServer);
                renderGameList(data);
                gametypeList.classList.remove('hidden');
            } catch (error) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
            } finally {
                loadingEl.classList.add('hidden');
            }
        } else {
            gametypeList.classList.remove('hidden');
        }
    });

    function renderGameList(games) {
        gametypeList.innerHTML = '';
        if (!games || games.length === 0) {
            gametypeList.innerHTML = '<li style="text-align:center">등록된 게임타입이 없어요!</li>';
            return;
        }

        games.forEach(game => {
            const li = document.createElement('li');
            li.className = 'game-item';
            
            const fallbackIcon = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'><rect width='36' height='36' fill='%23121212'/><text x='50%' y='50%' fill='white' font-size='16' text-anchor='middle' dy='.3em'>🎮</text></svg>`;
            const imgUrl = game.logo || fallbackIcon;
            
            li.innerHTML = `
                <img src="${imgUrl}" alt="${game.name}" onerror="this.onerror=null;this.src='${fallbackIcon}';" />
                <div class="info">
                    <div class="name">${game.name}</div>
                    <div class="id">ID: ${game.id}</div>
                </div>
            `;

            li.addEventListener('click', () => {
                currentGame = game;
                btnGametypeSelect.textContent = game.name + ' ▾';
                gametypeList.classList.add('hidden');
                generateDeeplink();
            });

            gametypeList.appendChild(li);
        });
    }

    function generateDeeplink() {
        if (!currentGame || !currentServer) return;

        let deeplink = '';
        if (currentServer === 'staging4') {
            deeplink = `https://stg4.spotvnow.co.kr/schedule/${currentGame.id}`;
        } else if (currentServer === 'product') {
            // 사용자가 Product도 같은 URL 형식을 요청함
            deeplink = `https://stg4.spotvnow.co.kr/schedule/${currentGame.id}`;
        }
        
        deeplinkUrlEl.textContent = deeplink;
        btnExecuteDeeplink.href = deeplink;
        deeplinkPanel.classList.remove('hidden');
        
        btnExecuteDeeplink.style.animation = 'none';
        setTimeout(() => {
            btnExecuteDeeplink.style.animation = 'pulse 1s';
        }, 10);
    }
    
    // 외부 영역 클릭 시 드롭다운 닫기
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            serverList.classList.add('hidden');
            gametypeList.classList.add('hidden');
        }
    });
}
