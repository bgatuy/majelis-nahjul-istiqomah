import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

lucide.createIcons();

// --- AUTH ACTIONS ---

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
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    errorMsg.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        errorMsg.classList.remove('hidden');
        errorMsg.textContent = 'Login Gagal: ' + error.message;
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
    // Jika berhasil, redirect akan ditangani oleh onAuthStateChange
}

// Listen to Auth State Changes
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        // Jika user sudah login, redirect ke halaman admin.
        // Menggunakan replace agar tidak bisa kembali ke halaman login dengan tombol back.
        window.location.replace('./admin.html');
    }
});