import { initNowTab } from './components/now-tab.js';
import { initSpozoneTab } from './components/spozone-tab.js';

document.addEventListener('DOMContentLoaded', () => {
    // 컴포넌트 초기화
    initNowTab();
    initSpozoneTab();

    // 탭 네비게이션 로직
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 모든 탭의 활성화 클래스 제거
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            // 클릭한 탭에 활성화 클래스 추가
            btn.classList.add('active');
            
            // 해당되는 패널 표시
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});
