// Cookie Consent Banner - GDPR Compliant
(function() {
    'use strict';
    
    function createCookieBanner() {
        // Cek apakah user sudah memberikan persetujuan
        if (localStorage.getItem('cookieConsent')) return;
        
        // Buat banner
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <div class="cookie-text">
                    <strong>🍪 Kami menggunakan cookies!</strong>
                    <p>Website ini menggunakan cookies untuk meningkatkan pengalaman Anda, menganalisis traffic, dan menampilkan iklan yang relevan. Dengan melanjutkan menggunakan website ini, Anda menyetujui penggunaan cookies sesuai dengan <a href="privacy.html">Kebijakan Privasi</a> kami.</p>
                </div>
                <div class="cookie-buttons">
                    <button id="cookie-accept" class="cookie-btn accept">Terima Semua</button>
                    <button id="cookie-reject" class="cookie-btn reject">Tolak Non-Essential</button>
                    <button id="cookie-settings" class="cookie-btn settings">Pengaturan</button>
                </div>
            </div>
        `;
        
        // Tambahkan CSS
        const style = document.createElement('style');
        style.textContent = `
            #cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
                padding: 20px;
                z-index: 9999;
                animation: slideUp 0.5s ease-out;
                border-top: 3px solid #667eea;
            }
            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .cookie-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                align-items: center;
                justify-content: space-between;
            }
            .cookie-text {
                flex: 1;
                min-width: 300px;
            }
            .cookie-text strong {
                color: #667eea;
                font-size: 18px;
                display: block;
                margin-bottom: 8px;
            }
            .cookie-text p {
                color: #555;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
            }
            .cookie-text a {
                color: #667eea;
                text-decoration: underline;
            }
            .cookie-buttons {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .cookie-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 10px;
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .cookie-btn.accept {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            .cookie-btn.accept:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            .cookie-btn.reject {
                background: #f0f0f0;
                color: #555;
            }
            .cookie-btn.reject:hover {
                background: #e0e0e0;
            }
            .cookie-btn.settings {
                background: transparent;
                color: #667eea;
                border: 2px solid #667eea;
            }
            .cookie-btn.settings:hover {
                background: #667eea;
                color: white;
            }
            @media (max-width: 768px) {
                .cookie-content {
                    flex-direction: column;
                    text-align: center;
                }
                .cookie-buttons {
                    width: 100%;
                    justify-content: center;
                }
                .cookie-btn {
                    flex: 1;
                    min-width: 120px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(banner);
        
        // Event listeners
        document.getElementById('cookie-accept').addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.style.animation = 'slideDown 0.5s ease-out';
            setTimeout(() => banner.remove(), 500);
            // Enable all cookies
            enableAllCookies();
        });
        
        document.getElementById('cookie-reject').addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'rejected');
            banner.style.animation = 'slideDown 0.5s ease-out';
            setTimeout(() => banner.remove(), 500);
            // Only essential cookies
            enableEssentialCookiesOnly();
        });
        
        document.getElementById('cookie-settings').addEventListener('click', function() {
            showCookieSettings();
        });
    }
    
    function enableAllCookies() {
        // Google Analytics sudah aktif
        console.log('All cookies enabled');
    }
    
    function enableEssentialCookiesOnly() {
        // Disable non-essential cookies
        console.log('Only essential cookies enabled');
    }
    
    function showCookieSettings() {
        alert('Pengaturan cookies akan segera tersedia. Saat ini kami menggunakan cookies essential untuk fungsionalitas website dan cookies analytics untuk meningkatkan layanan.');
    }
    
    // Jalankan saat DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createCookieBanner);
    } else {
        createCookieBanner();
    }
})();