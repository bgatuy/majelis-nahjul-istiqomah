import { createClient } from '@supabase/supabase-js'

// Inisialisasi Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

lucide.createIcons();

// --- DATA FETCHING ---

// Load Jadwal dari Supabase
async function loadSchedules() {
    const container = document.getElementById('admin-schedule-list');
    container.innerHTML = '<p class="text-center text-slate-500">Memuat data...</p>';

    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        container.innerHTML = '<p class="text-red-500">Gagal memuat data.</p>';
        return;
    }

    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = '<p class="text-slate-500">Belum ada jadwal.</p>';
        return;
    }

    data.forEach(item => {
        const dateStr = new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm';
        div.innerHTML = `
            <div class="min-w-0 flex-1 mr-4">
                <div class="font-bold text-emerald-900 truncate">${item.title}</div>
                <div class="text-sm text-slate-500 truncate">${dateStr} - ${item.time}</div>
                <div class="text-xs text-slate-400 truncate">${item.speaker} | ${item.location}</div>
            </div>
            <button class="delete-btn text-red-500 hover:bg-red-50 p-2 rounded shrink-0" data-id="${item.id}" data-type="schedule">
                <i data-lucide="trash-2" class="w-5 h-5"></i>
            </button>
        `;
        container.appendChild(div);
    });
    
    // Re-attach event listeners for delete buttons
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteItem(this.dataset.type, this.dataset.id);
        });
    });
    lucide.createIcons();
}

// Load Galeri dari Supabase
async function loadGallery() {
    const container = document.getElementById('admin-gallery-list');
    const countBadge = document.getElementById('gallery-count');
    container.innerHTML = '<div class="col-span-full flex flex-col items-center justify-center py-12 text-slate-400"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-2"></i><p>Memuat foto...</p></div>';

    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100"><p class="font-bold">Gagal memuat galeri</p><p class="text-sm mt-1">'+error.message+'</p></div>';
        return;
    }

    container.innerHTML = '';
    if (countBadge) countBadge.textContent = `${data.length} Foto`;

    if (data.length === 0) {
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <i data-lucide="image-off" class="w-12 h-12 mb-3 opacity-50"></i>
                <p>Belum ada foto di galeri.</p>
            </div>`;
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'group relative rounded-xl overflow-hidden aspect-square bg-slate-100 shadow-sm border border-slate-200 hover:shadow-md transition-all';
        div.innerHTML = `
            <img src="${item.image_url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p class="text-white text-xs font-medium line-clamp-2 mb-2">${item.caption || 'Tanpa Judul'}</p>
                <button class="delete-btn w-full bg-red-500/90 hover:bg-red-600 text-white py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 backdrop-blur-sm transition-colors" data-id="${item.id}" data-type="gallery">
                    <i data-lucide="trash-2" class="w-3 h-3"></i> Hapus
                </button>
            </div>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteItem(this.dataset.type, this.dataset.id);
        });
    });
    lucide.createIcons();
}

// --- ACTIONS ---

// Simpan Jadwal
window.saveSchedule = async function(e) {
    e.preventDefault();
    
    const newItem = {
        title: document.getElementById('sched-title').value,
        speaker: document.getElementById('sched-speaker').value,
        date: document.getElementById('sched-date').value,
        time: document.getElementById('sched-time').value,
        location: document.getElementById('sched-loc').value
    };
    
    const { error } = await supabase.from('schedules').insert([newItem]);

    if (error) {
        console.error(error);
        showModal('Gagal', 'Gagal menyimpan jadwal.', 'error');
    } else {
        showModal('Berhasil', 'Jadwal berhasil disimpan!', 'success');
        e.target.reset();
        loadSchedules();
    }
}

// Helper: Kompres Gambar
async function compressImage(file, targetSizeKB) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Resize jika terlalu besar (max 1280px)
                const MAX_DIMENSION = 1280;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height * MAX_DIMENSION) / width);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round((width * MAX_DIMENSION) / height);
                        height = MAX_DIMENSION;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Isi background putih agar PNG transparan tidak jadi hitam
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                
                ctx.drawImage(img, 0, 0, width, height);
                
                let quality = 0.9;
                let dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                // Loop kurangi kualitas sampai target tercapai
                while (dataUrl.length * 0.75 > targetSizeKB * 1024 && quality > 0.1) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                }
                
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// Simpan Galeri
window.saveGallery = async function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('gal-file');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn.innerHTML;

    const resetForm = () => {
        e.target.reset();
        document.getElementById('img-preview').classList.add('hidden');
        document.getElementById('img-preview').src = '';
        document.getElementById('upload-placeholder').classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
    };

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        
        // UI Loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span>Mengompres & Upload...</span>';
        lucide.createIcons();

        try {
            // Kompres ke ~150KB
            const compressedSrc = await compressImage(file, 150);

            const newItem = {
                image_url: compressedSrc,
                caption: ''
            };
            
            const { error } = await supabase.from('gallery').insert([newItem]);

            if (error) {
                console.error(error);
                showModal('Gagal', 'Gagal mengupload foto.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            } else {
                showModal('Berhasil', 'Foto berhasil ditambahkan!', 'success');
                resetForm();
                loadGallery();
            }
        } catch (err) {
            console.error(err);
            showModal('Error', 'Gagal memproses gambar.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    } else {
        showModal('Peringatan', 'Harap pilih file foto!', 'warning');
    }
}

window.previewImage = function(input) {
    const preview = document.getElementById('img-preview');
    const placeholder = document.getElementById('upload-placeholder');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '';
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }
}

// Hapus Item
window.deleteItem = function(type, id) {
    showModal('Konfirmasi Hapus', 'Yakin ingin menghapus item ini?', 'warning', async () => {
        let table = type === 'schedule' ? 'schedules' : 'gallery';
        
        const { error } = await supabase.from(table).delete().eq('id', id);

        if (error) {
            showModal('Gagal', 'Gagal menghapus data.', 'error');
        } else {
            if (type === 'schedule') {
                loadSchedules();
            } else {
                loadGallery();
            }
        }
    });
}

// Reset Data (Hapus Semua)
window.resetData = function(type) {
    const label = type === 'schedule' ? 'Jadwal' : 'Galeri';
    showModal('Hapus Semua Data?', `PERINGATAN: Tindakan ini akan menghapus SELURUH data ${label} dari database. Data yang dihapus tidak bisa dikembalikan. Lanjutkan?`, 'warning', async () => {
        const table = type === 'schedule' ? 'schedules' : 'gallery';
        
        // Menghapus semua data dengan filter ID > 0 (asumsi ID auto-increment)
        const { error } = await supabase.from(table).delete().gt('id', 0);

        if (error) {
            console.error('Reset error:', error);
            showModal('Gagal', `Gagal mereset data ${label}.`, 'error');
        } else {
            showModal('Berhasil', `Semua data ${label} berhasil dihapus.`, 'success');
            if (type === 'schedule') loadSchedules();
            else loadGallery();
        }
    });
}

// --- UI UTILS ---

window.togglePasswordVisibility = function() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        passwordInput.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

window.handleLogin = async function(e) {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    
    errorMsg.classList.add('hidden');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        errorMsg.classList.remove('hidden');
        errorMsg.textContent = 'Login Gagal: ' + error.message;
    }
}

window.switchTab = function(tabName) {
    // Simpan posisi tab terakhir ke LocalStorage
    localStorage.setItem('activeTab', tabName);

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('flex');
    });
    
    // Update Nav Items Styles
    const inactiveClasses = ['text-slate-400', 'md:text-emerald-100', 'hover:bg-slate-100', 'md:hover:bg-emerald-900'];
    const activeClasses = ['bg-emerald-900', 'text-white'];

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove(...activeClasses);
        el.classList.add(...inactiveClasses);
    });

    // Activate selected tab nav
    const activeNav = document.getElementById('nav-' + tabName);
    if (activeNav) {
        activeNav.classList.remove(...inactiveClasses);
        activeNav.classList.add(...activeClasses);
    }

    // Show selected tab content
    if (tabName === 'home') {
        document.getElementById('content-home').classList.remove('hidden');
    } else {
        const content = document.getElementById('content-' + tabName);
        if (content) {
            content.classList.remove('hidden');
            content.classList.add('flex');
        }
        
        // Render content when tab opens
        if(tabName === 'jadwal') loadSchedules();
        if(tabName === 'galeri') loadGallery();
    }
}

window.logout = async function() {
    await supabase.auth.signOut();
    // UI update handled by onAuthStateChange
}

// Listen to Auth State Changes
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
        document.getElementById('dashboard-container').classList.add('flex');
        
        // Buka tab terakhir yang disimpan (atau default ke home)
        const lastTab = localStorage.getItem('activeTab') || 'home';
        switchTab(lastTab);
    } else {
        document.getElementById('login-overlay').classList.remove('hidden');
        document.getElementById('dashboard-container').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('flex');
    }
});

let modalTimeout;

// Modal Helper (Global)
window.showModal = function(title, message, iconType, onConfirm) {
    const modal = document.getElementById('custom-modal');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalIcon = document.getElementById('modal-icon');
    const modalActions = document.getElementById('modal-actions');
    
    if (!modal) return;

    if (modalTimeout) {
        clearTimeout(modalTimeout);
        modalTimeout = null;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    modalActions.innerHTML = '';
    
    // Reset icon container styles
    modalIcon.className = 'mx-auto w-16 h-16 mb-5 flex items-center justify-center rounded-full transition-colors';
    
    if (iconType === 'warning' && onConfirm) {
        modalIcon.classList.add('bg-amber-100', 'text-amber-600');
        modalIcon.innerHTML = '<i data-lucide="alert-triangle" class="w-8 h-8"></i>';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm hover:shadow';
        confirmBtn.textContent = 'Ya, Lanjutkan';
        confirmBtn.onclick = () => {
            onConfirm();
            closeModal();
        };
        modalActions.appendChild(confirmBtn);
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl hover:bg-slate-200 font-medium transition-colors';
        cancelBtn.textContent = 'Batal';
        cancelBtn.onclick = closeModal;
        modalActions.appendChild(cancelBtn);
    } else {
        if (iconType === 'success') {
            modalIcon.classList.add('bg-emerald-100', 'text-emerald-600');
            modalIcon.innerHTML = '<i data-lucide="check" class="w-8 h-8"></i>';
        } else if (iconType === 'warning') {
            modalIcon.classList.add('bg-amber-100', 'text-amber-600');
            modalIcon.innerHTML = '<i data-lucide="alert-triangle" class="w-8 h-8"></i>';
        } else {
            modalIcon.classList.add('bg-red-100', 'text-red-600');
            modalIcon.innerHTML = '<i data-lucide="x" class="w-8 h-8"></i>';
        }
        
        // Tombol Tutup Professional
        const okBtn = document.createElement('button');
        okBtn.className = 'bg-emerald-950 text-white px-8 py-2.5 rounded-xl hover:bg-emerald-900 font-medium transition-all shadow-sm hover:shadow-md active:scale-95';
        okBtn.textContent = 'Tutup';
        okBtn.onclick = closeModal;
        modalActions.appendChild(okBtn);
    }
    lucide.createIcons();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Animate In
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modalContent) {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }
    }, 10);

    // Close function with animation
    function closeModal() {
        modal.classList.add('opacity-0');
        if (modalContent) {
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
        }
        modalTimeout = setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modalTimeout = null;
        }, 300);
    }

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
}
