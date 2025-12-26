// Inisialisasi Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const scheduleContainer = document.getElementById('schedule-container');
const galleryContainer = document.getElementById('gallery-container');

// --- Event Listeners & UI Logic ---

// Toggle Mobile Menu
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Copy to Clipboard Function (dipanggil dari HTML onclick)
window.copyToClipboard = function() {
    const text = document.getElementById('rekening-number').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showModal('Berhasil', 'Nomor rekening berhasil disalin!', 'check');
    }).catch(err => {
        console.error('Gagal menyalin: ', err);
        showModal('Gagal', 'Gagal menyalin nomor rekening.', 'x');
    });
};

// Modal Notification Logic
function showModal(title, message, iconType) {
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalIcon = document.getElementById('modal-icon');
    
    if (!modal) return;

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    if (iconType === 'check') {
        modalIcon.innerHTML = '<i data-lucide="check" class="w-6 h-6"></i>';
    } else {
        modalIcon.innerHTML = '<i data-lucide="alert-circle" class="w-6 h-6"></i>';
    }
    lucide.createIcons();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 200);
        }
    };
}

// --- Supabase Data Fetching ---

// Ambil Data Jadwal
async function fetchSchedules() {
    if (!scheduleContainer) return;
    
    scheduleContainer.innerHTML = '<p class="text-center col-span-2 text-slate-500">Memuat jadwal...</p>';

    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error('Error:', error);
        scheduleContainer.innerHTML = '<p class="text-center col-span-2 text-red-500">Gagal memuat jadwal.</p>';
        return;
    }

    scheduleContainer.innerHTML = '';
    
    if (!data || data.length === 0) {
        scheduleContainer.innerHTML = '<p class="text-center col-span-2 text-slate-500">Belum ada jadwal kajian.</p>';
        return;
    }

    data.forEach(item => {
        const dateObj = new Date(item.date);
        const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        
        const card = `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div class="flex items-start justify-between mb-4">
                    <div class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Kajian Rutin</div>
                    <span class="text-slate-400 text-sm flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${item.time}</span>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">${item.title}</h3>
                <div class="space-y-2 text-slate-600 mb-4">
                    <div class="flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4 text-amber-500"></i><span>${dateStr}</span></div>
                    <div class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4 text-amber-500"></i><span>${item.speaker}</span></div>
                    <div class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-amber-500"></i><span>${item.location}</span></div>
                </div>
            </div>`;
        scheduleContainer.innerHTML += card;
    });
    lucide.createIcons();
}

// Ambil Data Galeri
async function fetchGallery() {
    if (!galleryContainer) return;

    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(10);

    if (!error && data && data.length > 0) {
        galleryContainer.innerHTML = '';
        data.forEach(item => {
            const div = `
                <div class="relative group overflow-hidden rounded-xl aspect-square bg-slate-200">
                    <img src="${item.image_url}" alt="${item.caption || 'Dokumentasi'}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                </div>`;
            galleryContainer.innerHTML += div;
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchSchedules();
    fetchGallery();
});