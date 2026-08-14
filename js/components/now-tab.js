import { fetchGameTypes } from '../api/api.js';

export function initNowTab() {
    const fetchBtn = document.getElementById('btn-fetch-games');
    const gameListEl = document.getElementById('game-list');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const deeplinkPanel = document.getElementById('deeplink-panel');
    const deeplinkUrlEl = document.getElementById('deeplink-url');
    const btnExecuteDeeplink = document.getElementById('btn-execute-deeplink');

    fetchBtn.addEventListener('click', async () => {
        // Reset state
        gameListEl.innerHTML = '';
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
        deeplinkPanel.classList.add('hidden');
        loadingEl.classList.remove('hidden');

        // Get selected server
        const selectedServer = document.querySelector('input[name="server"]:checked').value;

        try {
            const data = await fetchGameTypes(selectedServer);
            renderGameList(data, selectedServer);
        } catch (error) {
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
        } finally {
            loadingEl.classList.add('hidden');
        }
    });

    function renderGameList(games, server) {
        if (!games || games.length === 0) {
            gameListEl.innerHTML = '<li>등록된 게임타입이 없어요!</li>';
            return;
        }

        games.forEach(game => {
            const li = document.createElement('li');
            li.className = 'game-item';
            
            const imgUrl = game.logo || 'https://via.placeholder.com/50?text=No+Img';
            
            li.innerHTML = `
                <img src="${imgUrl}" alt="${game.name}" />
                <div class="info">
                    <div class="name">${game.name}</div>
                    <div class="id">ID: ${game.id} | Code: ${game.code}</div>
                </div>
            `;

            li.addEventListener('click', () => {
                // Highlight selection
                document.querySelectorAll('.game-item').forEach(el => el.classList.remove('selected'));
                li.classList.add('selected');

                // Generate DeepLink
                generateDeeplink(game, server);
            });

            gameListEl.appendChild(li);
        });
    }

    function generateDeeplink(game, server) {
        // Construct a sample deeplink based on the selected server and game info
        // Example: spotvnow://gametype?code=2026ag&server=staging4
        const scheme = 'spotvnow://';
        const action = 'gametype';
        const params = new URLSearchParams({
            id: game.id,
            code: game.code,
            server: server
        }).toString();
        
        const deeplink = `${scheme}${action}?${params}`;
        
        // Show panel
        deeplinkUrlEl.textContent = deeplink;
        btnExecuteDeeplink.href = deeplink;
        deeplinkPanel.classList.remove('hidden');
        
        // Add a cute bounce effect to the execute button
        btnExecuteDeeplink.style.animation = 'none';
        setTimeout(() => {
            btnExecuteDeeplink.style.animation = 'pulse 1s';
        }, 10);
    }
}
