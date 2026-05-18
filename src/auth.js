import { supabase } from './supabaseClient.js';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Speed Insights
injectSpeedInsights();

let isLogin = true;

const form = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const toggleModeBtn = document.getElementById('toggle-mode');
const toggleText = document.getElementById('toggle-text');
const formTitle = document.getElementById('form-title');
const errorMsg = document.getElementById('error-msg');

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute window
const LOCKOUT_MS = 60 * 1000; // 1 minute lockout

function getAuthAttempts() {
  try {
    const data = localStorage.getItem('hp_auth_attempts');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveAuthAttempts(attempts) {
  localStorage.setItem('hp_auth_attempts', JSON.stringify(attempts));
}

function getLockoutTime() {
  const lockout = localStorage.getItem('hp_auth_lockout');
  return lockout ? parseInt(lockout) : 0;
}

function saveLockoutTime(time) {
  localStorage.setItem('hp_auth_lockout', time.toString());
}

function checkRateLimit() {
  const now = Date.now();
  const lockoutTime = getLockoutTime();
  
  if (lockoutTime && now < lockoutTime) {
    const remaining = Math.ceil((lockoutTime - now) / 1000);
    return { limited: true, remaining };
  }
  
  // Clean up attempts outside the 1 minute window
  let attempts = getAuthAttempts();
  attempts = attempts.filter(timestamp => now - timestamp < WINDOW_MS);
  saveAuthAttempts(attempts);
  
  if (attempts.length >= MAX_ATTEMPTS) {
    const newLockout = now + LOCKOUT_MS;
    saveLockoutTime(newLockout);
    return { limited: true, remaining: Math.ceil(LOCKOUT_MS / 1000) };
  }
  
  return { limited: false };
}

function recordAttempt() {
  const attempts = getAuthAttempts();
  attempts.push(Date.now());
  saveAuthAttempts(attempts);
}

let countdownInterval = null;
function startLockoutCountdown(remaining) {
  if (countdownInterval) clearInterval(countdownInterval);
  submitBtn.disabled = true;
  let sec = remaining;
  
  countdownInterval = setInterval(() => {
    sec--;
    if (sec <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      submitBtn.disabled = false;
      submitBtn.textContent = isLogin ? 'Sign In' : 'Sign Up';
      errorMsg.textContent = '';
      localStorage.removeItem('hp_auth_lockout');
    } else {
      submitBtn.textContent = `Locked (${sec}s)`;
      errorMsg.textContent = `Too many login/signup attempts. Please wait ${sec} seconds.`;
    }
  }, 1000);
  
  submitBtn.textContent = `Locked (${sec}s)`;
  errorMsg.textContent = `Too many login/signup attempts. Please wait ${sec} seconds.`;
}

// Initial check on load
if (submitBtn) {
  const initialCheck = checkRateLimit();
  if (initialCheck.limited) {
    startLockoutCountdown(initialCheck.remaining);
  }
}

if (toggleModeBtn) {
  toggleModeBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    if (countdownInterval) {
      // If locked out, keep the lockout visual intact
      return;
    }
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

    // Check rate limit before executing
    const limitCheck = checkRateLimit();
    if (limitCheck.limited) {
      startLockoutCountdown(limitCheck.remaining);
      return;
    }

    // Record the current login/signup attempt
    recordAttempt();

    const email = emailInput.value;
    const password = passwordInput.value;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Success! Clear attempt history
        localStorage.removeItem('hp_auth_attempts');
        localStorage.removeItem('hp_auth_lockout');
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
      // Re-enable only if NOT rate limited
      const postCheck = checkRateLimit();
      if (postCheck.limited) {
        startLockoutCountdown(postCheck.remaining);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = isLogin ? 'Sign In' : 'Sign Up';
      }
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
