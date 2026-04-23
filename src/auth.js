import { supabase } from './supabaseClient.js';

let isLogin = true;

const form = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const toggleModeBtn = document.getElementById('toggle-mode');
const toggleText = document.getElementById('toggle-text');
const formTitle = document.getElementById('form-title');
const errorMsg = document.getElementById('error-msg');

if (toggleModeBtn) {
  toggleModeBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    if (isLogin) {
      formTitle.textContent = 'Welcome Back';
      submitBtn.textContent = 'Sign In';
      toggleText.textContent = "Don't have an account? ";
      toggleModeBtn.textContent = 'Sign Up';
    } else {
      formTitle.textContent = 'Create Account';
      submitBtn.textContent = 'Sign Up';
      toggleText.textContent = 'Already have an account? ';
      toggleModeBtn.textContent = 'Sign In';
    }
    errorMsg.textContent = '';
  });
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    const email = emailInput.value;
    const password = passwordInput.value;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/';
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email to confirm signup or try logging in if auto-confirm is enabled!');
        isLogin = true;
        toggleModeBtn.click();
      }
    } catch (err) {
      errorMsg.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isLogin ? 'Sign In' : 'Sign Up';
    }
  });
}

// Check session on load to redirect if already logged in
export async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session && window.location.pathname.includes('login.html')) {
    window.location.href = '/';
  } else if (!session && !window.location.pathname.includes('login.html')) {
    // Force log in
    window.location.href = '/login.html';
  }
  return session;
}

if (window.location.pathname.includes('login.html')) {
  checkSession();
}
