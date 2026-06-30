// Social Share Buttons
(function() {
    'use strict';
    
    function createShareButtons() {
        // Hanya tampilkan di halaman artikel/kalkulator
        const shareDiv = document.createElement('div');
        shareDiv.className = 'social-share';
        shareDiv.innerHTML = `
            <div class="share-title">📢 Bagikan ke Teman:</div>
            <div class="share-buttons">
                <a href="#" class="share-btn whatsapp" onclick="shareWhatsApp(event)">
                    <span class="share-icon">📱</span>
                    <span>WhatsApp</span>
                </a>
                <a href="#" class="share-btn facebook" onclick="shareFacebook(event)">
                    <span class="share-icon">📘</span>
                    <span>Facebook</span>
                </a>
                <a href="#" class="share-btn twitter" onclick="shareTwitter(event)">
                    <span class="share-icon">🐦</span>
                    <span>Twitter</span>
                </a>
                <a href="#" class="share-btn telegram" onclick="shareTelegram(event)">
                    <span class="share-icon">✈️</span>
                    <span>Telegram</span>
                </a>
                <a href="#" class="share-btn copy" onclick="copyLink(event)">
                    <span class="share-icon">🔗</span>
                    <span>Copy Link</span>
                </a>
            </div>
        `;
        
        // Tambahkan CSS
        const style = document.createElement('style');
        style.textContent = `
            .social-share {
                background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
                padding: 25px;
                border-radius: 16px;
                margin: 30px 0;
                text-align: center;
                border: 2px solid #e8ecf1;
            }
            .share-title {
                font-size: 18px;
                font-weight: 700;
                color: #333;
                margin-bottom: 15px;
            }
            .share-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
            }
            .share-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 18px;
                border-radius: 50px;
                text-decoration: none;
                color: white;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .share-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }
            .share-btn.whatsapp { background: #25D366; }
            .share-btn.facebook { background: #1877F2; }
            .share-btn.twitter { background: #1DA1F2; }
            .share-btn.telegram { background: #0088cc; }
            .share-btn.copy { background: #667eea; }
            .share-icon { font-size: 18px; }
            @media (max-width: 768px) {
                .share-btn { padding: 8px 14px; font-size: 13px; }
                .share-btn span:not(.share-icon) { display: none; }
            }
        `;
        
        document.head.appendChild(style);
        
        // Tambahkan sebelum footer
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.parentNode.insertBefore(shareDiv, footer);
        }
    }
    
    window.shareWhatsApp = function(e) {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title + ' - Coba kalkulator gratis ini!');
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    };
    
    window.shareFacebook = function(e) {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };
    
    window.shareTwitter = function(e) {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    };
    
    window.shareTelegram = function(e) {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    };
    
    window.copyLink = function(e) {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link berhasil dicopy! 📋');
        });
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createShareButtons);
    } else {
        createShareButtons();
    }
})();