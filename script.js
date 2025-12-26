/* d:\nahjul istiqomah\script.js */

// ==========================================
// 1. DATA CONFIG (UPDATE DATA DISINI)
// ==========================================

// --- DATA JADWAL ---
// dayIndex: 0=Ahad, 1=Senin, ..., 6=Sabtu
const defaultScheduleData = [];

// --- DATA GALERI ---
// type: 'image' (foto) atau 'gradient' (warna saja)
const defaultGalleryData = [];

// Load Data from LocalStorage (Prioritas Utama)
// Jika tidak ada di LocalStorage, pakai data bawaan
let scheduleData = [...defaultScheduleData];
try {
    const storedSchedule = localStorage.getItem('mni_schedule');
    if (storedSchedule) scheduleData = JSON.parse(storedSchedule);
} catch (e) {
    console.error("Data jadwal corrupt, reset ke default");
}

let galleryData = [...defaultGalleryData];
try {
    const storedGallery = localStorage.getItem('mni_gallery');
    if (storedGallery) galleryData = JSON.parse(storedGallery);
} catch (e) {
    console.error("Data galeri corrupt, reset ke default");
}

// ==========================================
// 2. LOGIC RENDER (JANGAN DIUBAH KECUALI PAHAM)
// ==========================================

function renderContent() {
    // Render Schedule
    const scheduleContainer = document.getElementById('schedule-container');
    if (scheduleContainer) {
        scheduleContainer.innerHTML = scheduleData.map(item => `
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-amber-400 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:shadow-lg transition-all hover:-translate-y-1 group ${item.isWide ? 'md:col-span-2' : ''}">
                <div class="bg-gradient-to-br ${item.color === 'slate' ? 'from-slate-100 to-slate-200 text-slate-600' : item.color === 'amber' ? 'from-amber-100 to-amber-200 text-amber-800' : 'from-emerald-100 to-emerald-200 text-emerald-800'} rounded-xl p-4 text-center min-w-[100px] shadow-inner">
                    <span class="block text-sm font-bold uppercase tracking-wider opacity-70">${item.dayTitle}</span>
                    <span class="block text-3xl font-bold">${item.dayName}</span>
                </div>
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">${item.title}</h3>
                    <p class="text-slate-500 text-sm mt-1 mb-3 flex items-center gap-1">
                        <i data-lucide="clock" class="w-3 h-3"></i> ${item.time}
                    </p>
                    <div class="flex items-center gap-2 text-sm text-slate-600">
                        <i data-lucide="map-pin" class="w-4 h-4 text-amber-500"></i>
                        <span>${item.location}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render Gallery
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
        galleryContainer.innerHTML = galleryData.map(item => {
            if (item.type === 'image') {
                return `
                <div class="group relative aspect-video rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:-translate-y-1 bg-slate-100">
                    <img src="${item.src}" alt="${item.title}" class="w-full h-full object-cover">
                    
                    <div class="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/20 to-transparent opacity-90"></div>
                    
                    <div class="absolute bottom-0 left-0 w-full p-3">
                        <h4 class="font-bold text-white text-sm leading-tight truncate group-hover:text-amber-300 transition-colors" title="${item.title}">
                            ${item.title}
                        </h4>
                    </div>
                </div>`;
            } else {
                // Style untuk Card Info (Non-Image) agar ukurannya sama
                return `
                <div class="group relative aspect-video rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-${item.from} to-${item.to} flex items-center justify-between p-4 border border-slate-100">
                    <div class="text-white">
                        <h4 class="font-bold text-lg leading-tight">${item.title}</h4>
                        <span class="text-[10px] opacity-75 uppercase tracking-wider">Info Terkini</span>
                    </div>
                    <i data-lucide="${item.icon}" class="w-10 h-10 text-white opacity-30 group-hover:scale-110 transition-transform"></i>
                </div>`;
            }
        }).join('');
    }
    
    // Re-init icons after dynamic content
    lucide.createIcons();
}

// Run render immediately
renderContent();

// Initialize Lucide Icons
lucide.createIcons();

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('bg-emerald-950/90', 'backdrop-blur-md', 'border-b', 'border-white/10', 'shadow-lg', 'py-3');
            navbar.classList.remove('py-5', 'bg-transparent');
        } else {
            navbar.classList.add('py-5', 'bg-transparent');
            navbar.classList.remove('bg-emerald-950/90', 'backdrop-blur-md', 'border-b', 'border-white/10', 'shadow-lg', 'py-3');
        }
    });
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');
let isMenuOpen = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.remove('hidden');
        // Change icon to X
        mobileMenuBtn.innerHTML = '<i data-lucide="x" class="w-7 h-7"></i>';
    } else {
        mobileMenu.classList.add('hidden');
        // Change icon back to Menu
        mobileMenuBtn.innerHTML = '<i data-lucide="menu" class="w-7 h-7"></i>';
    }
    lucide.createIcons(); // Re-render icons
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
}

// Close mobile menu when a link is clicked
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (isMenuOpen) toggleMenu();
    });
});

// Close mobile menu when clicking outside (Tap Sembarang)
document.addEventListener('click', (e) => {
    if (isMenuOpen && mobileMenu && mobileMenuBtn && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        toggleMenu();
    }
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Copy to Clipboard Function (Global scope for onclick)
window.copyToClipboard = function() {
    const textToCopy = "1234567890"; // Rekening number raw
    
    // Modern API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showModal('Berhasil', 'Nomor rekening berhasil disalin!', 'success');
        }).catch(err => {
            console.error('Gagal menyalin: ', err);
            fallbackCopyTextToClipboard(textToCopy);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(textToCopy);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure textarea is not visible but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showModal('Berhasil', 'Nomor rekening berhasil disalin!', 'success');
        } else {
            showModal('Gagal', 'Gagal menyalin nomor rekening.', 'error');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

// ==========================================
// 5. CUSTOM MODAL SYSTEM
// ==========================================

window.showModal = function(title, message, type = 'info', onConfirm = null) {
    const modal = document.getElementById('custom-modal');
    if (!modal) {
        // Fallback jika HTML modal belum ada
        if (onConfirm) { if(confirm(message)) onConfirm(); } 
        else { alert(message); }
        return;
    }

    const content = document.getElementById('modal-content');
    const iconContainer = document.getElementById('modal-icon');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actionsEl = document.getElementById('modal-actions');

    // Set Content
    titleEl.textContent = title;
    msgEl.textContent = message;

    // Set Icon & Color
    iconContainer.className = 'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors';
    if (type === 'success') {
        iconContainer.classList.add('bg-emerald-100', 'text-emerald-600');
        iconContainer.innerHTML = '<i data-lucide="check" class="w-6 h-6"></i>';
    } else if (type === 'error') {
        iconContainer.classList.add('bg-red-100', 'text-red-600');
        iconContainer.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
    } else if (type === 'warning') {
        iconContainer.classList.add('bg-amber-100', 'text-amber-600');
        iconContainer.innerHTML = '<i data-lucide="alert-triangle" class="w-6 h-6"></i>';
    } else {
        iconContainer.classList.add('bg-blue-100', 'text-blue-600');
        iconContainer.innerHTML = '<i data-lucide="info" class="w-6 h-6"></i>';
    }

    // Set Buttons
    actionsEl.innerHTML = '';
    
    if (onConfirm) {
        // Confirm Dialog (Dua Tombol)
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors';
        cancelBtn.textContent = 'Batal';
        cancelBtn.onclick = window.closeModal;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-md hover:shadow-lg';
        confirmBtn.textContent = 'Ya, Lanjutkan';
        confirmBtn.onclick = () => { window.closeModal(); onConfirm(); };
        
        actionsEl.appendChild(cancelBtn);
        actionsEl.appendChild(confirmBtn);
    } else {
        // Alert Dialog (Satu Tombol)
        const okBtn = document.createElement('button');
        okBtn.className = 'w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-md';
        okBtn.textContent = 'Oke, Mengerti';
        okBtn.onclick = window.closeModal;
        actionsEl.appendChild(okBtn);
    }

    // Show with Animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Small delay for transition
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
    
    if(window.lucide) window.lucide.createIcons();
}

window.closeModal = function() {
    const modal = document.getElementById('custom-modal');
    const content = document.getElementById('modal-content');
    if (modal && content) {
        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 200);
    }
}
