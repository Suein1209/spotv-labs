import { initNowTab } from './components/now-tab.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initNowTab();

    // Tab Navigation Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            // Add active class to clicked tab
            btn.classList.add('active');
            
            // Show corresponding panel
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});
