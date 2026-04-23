import { createIcons, Cloud, Grid, User, Search, Mic, Camera, Globe, Globe2, Server, MapPin, Clock, X, BookmarkPlus, PlusCircle, LogOut, ChevronDown, Trash2, ExternalLink, Palette, Settings2, Shield, FileText, Link } from 'lucide';
import { supabase } from './supabaseClient.js';
import { checkSession } from './auth.js';
import { customPrompt, customConfirm } from './dialogs.js';

const lucideIcons = { Cloud, Grid, User, Search, Mic, Camera, Globe, Globe2, Server, MapPin, Clock, X, BookmarkPlus, PlusCircle, LogOut, ChevronDown, Trash2, ExternalLink, Palette, Settings2, Shield, FileText, Link };

function refreshIcons() {
  createIcons({ icons: lucideIcons });
}

// Init Icons
refreshIcons();

// App State
let settings = {
  darkMode: true,
  profileName: 'Guest',
  profileIconUrl: '',
  bgUrl: '',
  clockStyle: '1',
  timeFormat: '12',
  weatherLocation: '',
  weatherLat: '40.71',
  weatherLon: '-74.00',
  defaultSearchEngine: 'https://www.google.com/search?q=',
  customBgColor: '#0b1120',
  customAccentColor: '#3b82f6',
  searchNewTab: false,
  notepadText: ''
};

let bookmarks = [
  { title: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
  { title: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { title: 'Twitter', url: 'https://twitter.com', icon: '🐦' }
];

let webLinks = [
  { title: 'Google', url: 'https://www.google.com' },
  { title: 'ChatGPT', url: 'https://chat.openai.com' }
];

// Load settings from Supabase
async function initSession() {
  const session = await checkSession();
  if (session) {
    const userId = session.user.id;

    // 1. Load Profile (Settings, Name, Icon, BG)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      if (profile.settings) settings = { ...settings, ...profile.settings };
      settings.profileName = profile.profile_name || 'Guest';
      settings.profileIconUrl = profile.profile_icon_url || '';
      settings.bgUrl = profile.bg_url || '';
    }

    // 2. Load Bookmarks
    const { data: dbBookmarks } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (dbBookmarks && dbBookmarks.length > 0) {
      bookmarks = dbBookmarks;
    }

    // 3. Load Web Links
    const { data: dbLinks } = await supabase
      .from('web_links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (dbLinks && dbLinks.length > 0) {
      webLinks = dbLinks;
    }

    document.getElementById('user-email-display').textContent = session.user.email;
    document.getElementById('settings-user-email').textContent = session.user.email;
  } else {
    // Local storage fallback
    const localSett = JSON.parse(localStorage.getItem('hp_settings'));
    if (localSett) settings = { ...settings, ...localSett };
    bookmarks = JSON.parse(localStorage.getItem('hp_bookmarks')) || bookmarks;
    webLinks = JSON.parse(localStorage.getItem('hp_weblinks')) || webLinks;

    document.getElementById('user-email-display').textContent = `Not logged in`;
    document.getElementById('settings-user-email').textContent = `Local storage only`;
  }
  applySettings();
  renderBookmarks();
}

async function saveState() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const userId = session.user.id;

    // 1. Save Profile
    await supabase.from('profiles').upsert({
      id: userId,
      settings: {
        darkMode: settings.darkMode,
        clockStyle: settings.clockStyle,
        timeFormat: settings.timeFormat,
        weatherLocation: settings.weatherLocation,
        weatherLat: settings.weatherLat,
        weatherLon: settings.weatherLon,
        defaultSearchEngine: settings.defaultSearchEngine,
        customBgColor: settings.customBgColor,
        customAccentColor: settings.customAccentColor,
        searchNewTab: settings.searchNewTab
      },
      profile_name: settings.profileName,
      profile_icon_url: settings.profileIconUrl,
      bg_url: settings.bgUrl,
      updated_at: new Date().toISOString()
    });

    // Note: Bookmarks and WebLinks are usually saved individually when added/deleted
    // but for compatibility with the current bulk-save style, we'll do this:
    // (In a real app, you'd add/delete specific rows, but let's keep it simple for now)
  } else {
    localStorage.setItem('hp_settings', JSON.stringify(settings));
    localStorage.setItem('hp_bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('hp_weblinks', JSON.stringify(webLinks));
  }
}


// --- DOM ELEMENTS ---
const clockEl = document.getElementById('clock-container');
const clockTextEl = document.getElementById('clock-text');
const clockAnalogEl = document.getElementById('clock-analog');
const hourHand = document.getElementById('hour-hand');
const minHand = document.getElementById('min-hand');
const secHand = document.getElementById('sec-hand');

const bodyEl = document.body;
// Modals
const settingsModal = document.getElementById('settings-modal');
const waffleModal = document.getElementById('waffle-modal');
const weatherModal = document.getElementById('weather-modal');
const profileBtn = document.getElementById('profile-btn');
const waffleBtn = document.getElementById('waffle-btn');
const weatherWidget = document.getElementById('weather-widget');
const closeBtns = document.querySelectorAll('.modal-close');

// Settings Inputs
const darkModeToggle = document.getElementById('dark-mode-toggle');
const nameInput = document.getElementById('profile-name');
const profileUpload = document.getElementById('profile-upload');
const bgUpload = document.getElementById('bg-upload');
const clockSelect = document.getElementById('clock-style-select');
const timeFormatSelect = document.getElementById('time-format-select');
const wLocationInput = document.getElementById('weather-location');
const bgColorPicker = document.getElementById('bg-color-picker');
const accentColorPicker = document.getElementById('accent-color-picker');
const autoLocateBtn = document.getElementById('auto-locate-btn');
const searchNewTabToggle = document.getElementById('search-new-tab-toggle');
const defaultSearchSelect = document.getElementById('default-search-select');

// Profile Icon Image elements
const defaultProfileIcon = document.getElementById('default-profile-icon');
const customProfileImg = document.getElementById('custom-profile-img');
const settingsProfileImg = document.getElementById('settings-profile-img');
const settingsDisplayName = document.getElementById('settings-display-name');

// Notepad & Apps
const openNotepadBtn = document.getElementById('open-notepad-btn');
const openWebLinkBtn = document.getElementById('open-web-link-btn');
const openBookmarkMgr = document.getElementById('open-bookmark-mgr');
const notepadModal = document.getElementById('notepad-modal');
const notepadTextarea = document.getElementById('notepad-textarea');
const clearNotepadBtn = document.getElementById('clear-notepad-btn');

// Web links
const weblinkModal = document.getElementById('weblink-modal');
const weblinkList = document.getElementById('weblink-list');
const addWeblinkBtn = document.getElementById('add-weblink-btn');

// --- CLOCK ---
function updateClock() {
  const now = new Date();
  
  if (settings.clockStyle === '4') {
    clockTextEl.style.display = 'none';
    clockAnalogEl.style.display = 'flex';
    
    const seconds = now.getSeconds();
    const mins = now.getMinutes();
    const hours = now.getHours();
    
    const secondDeg = ((seconds / 60) * 360) + 90;
    const minDeg = ((mins / 60) * 360) + ((seconds/60)*6) + 90;
    const hourDeg = ((hours / 12) * 360) + ((mins/60)*30) + 90;
    
    secHand.style.transform = `rotate(${secondDeg}deg)`;
    minHand.style.transform = `rotate(${minDeg}deg)`;
    hourHand.style.transform = `rotate(${hourDeg}deg)`;
    
  } else {
    clockAnalogEl.style.display = 'none';
    clockTextEl.style.display = 'block';
    
    let hrs = now.getHours();
    const minsText = now.getMinutes().toString().padStart(2, '0');
    
    if (settings.timeFormat === '12') {
      hrs = hrs % 12 || 12;
    } else {
      hrs = hrs.toString().padStart(2, '0');
    }
    clockTextEl.textContent = `${hrs}:${minsText}`;
  }
}
setInterval(updateClock, 1000);

clockEl.addEventListener('click', () => {
  let curr = parseInt(settings.clockStyle);
  curr = curr >= 4 ? 1 : curr + 1;
  clockSelect.value = curr.toString();
  handleSettingChange();
});

// --- SETTINGS MAPPING ---
function applySettings() {
  // Appearance
  bodyEl.classList.toggle('light-mode', !settings.darkMode);
  
  if (settings.customBgColor) document.documentElement.style.setProperty('--bg-color', settings.customBgColor);
  if (settings.customAccentColor) document.documentElement.style.setProperty('--accent-color', settings.customAccentColor);

  if (settings.bgUrl) {
    bodyEl.style.backgroundImage = `url('${settings.bgUrl}')`;
    bodyEl.style.backgroundSize = 'cover';
    bodyEl.style.backgroundPosition = 'center';
  } else {
    bodyEl.style.backgroundImage = ''; 
  }

  if (settings.profileIconUrl) {
    defaultProfileIcon.style.display = 'none';
    customProfileImg.style.display = 'block';
    customProfileImg.src = settings.profileIconUrl;
    if (settingsProfileImg) settingsProfileImg.src = settings.profileIconUrl;
  } else {
    defaultProfileIcon.style.display = 'block';
    customProfileImg.style.display = 'none';
    if (settingsProfileImg) settingsProfileImg.src = '/favicon.svg';
  }

  if (settingsDisplayName) settingsDisplayName.textContent = settings.profileName || 'Guest';

  // Clock
  clockEl.className = `clock-style-${settings.clockStyle}`;
  updateClock();

  // Bind values
  darkModeToggle.checked = settings.darkMode;
  nameInput.value = settings.profileName;
  clockSelect.value = settings.clockStyle;
  timeFormatSelect.value = settings.timeFormat;
  wLocationInput.value = settings.weatherLocation || '';
  bgColorPicker.value = settings.customBgColor || '#0b1120';
  accentColorPicker.value = settings.customAccentColor || '#3b82f6';
  searchNewTabToggle.checked = !!settings.searchNewTab;
  if(defaultSearchSelect) defaultSearchSelect.value = settings.defaultSearchEngine;
  
  if (notepadTextarea && typeof settings.notepadText === 'string' && notepadTextarea.value !== settings.notepadText) {
    notepadTextarea.value = settings.notepadText;
  }
  
  updateEngineUI();
  fetchWeather();
}

async function resolveLocationAndSave() {
  if (wLocationInput.value.trim() !== '') {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(wLocationInput.value)}&count=1`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        settings.weatherLat = data.results[0].latitude;
        settings.weatherLon = data.results[0].longitude;
      }
    } catch (e) {
      console.warn("Geocoding failed", e);
    }
  }
}

async function handleSettingChange() {
  settings.darkMode = darkModeToggle.checked;
  settings.profileName = nameInput.value;
  settings.clockStyle = clockSelect.value;
  settings.timeFormat = timeFormatSelect.value;
  settings.weatherLocation = wLocationInput.value;
  settings.customBgColor = bgColorPicker.value;
  settings.customAccentColor = accentColorPicker.value;
  settings.searchNewTab = searchNewTabToggle.checked;
  if(defaultSearchSelect) settings.defaultSearchEngine = defaultSearchSelect.value;
  
  applySettings();
  saveState();
}

wLocationInput.addEventListener('change', async () => {
  if (wLocationInput.value !== settings.weatherLocation) {
    autoLocateBtn.innerHTML = "Resolving...";
    await resolveLocationAndSave();
    autoLocateBtn.innerHTML = `<i data-lucide="map-pin" style="width: 16px; height: 16px;"></i> Auto Locate`;
    refreshIcons();
    handleSettingChange();
  }
});

[darkModeToggle, clockSelect, timeFormatSelect, bgColorPicker, accentColorPicker, searchNewTabToggle, defaultSearchSelect].forEach(el => {
  if(el) el.addEventListener('change', handleSettingChange);
});

[nameInput].forEach(el => {
  if(el) el.addEventListener('blur', handleSettingChange);
});

// Handle File Uploads (compress to base64)
function handleFileUpload(inputEl, width, callback) {
  inputEl.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let ratio = width / img.width;
        if (ratio > 1) ratio = 1; // don't upscale
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(dataUrl);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

handleFileUpload(profileUpload, 128, (b64) => {
  settings.profileIconUrl = b64;
  handleSettingChange();
});

handleFileUpload(bgUpload, 1280, (b64) => {
  settings.bgUrl = b64;
  handleSettingChange();
});

// --- MODALS ---
profileBtn.addEventListener('click', () => settingsModal.classList.add('active'));
waffleBtn.addEventListener('click', () => waffleModal.classList.add('active'));
weatherWidget.addEventListener('click', () => weatherModal.classList.add('active'));

openNotepadBtn.addEventListener('click', () => {
  window.location.href = '/notepad.html';
});

openBookmarkMgr.addEventListener('click', () => {
  window.location.href = '/bookmarks.html';
});

// Web Link Manager
function renderWebLinks() {
  if (!weblinkList) return;
  weblinkList.innerHTML = '';
  
  if (webLinks.length === 0) {
    weblinkList.innerHTML = '<p style="text-align:center; color:var(--text-secondary); margin-top:1rem;">No web links saved.</p>';
    return;
  }

  webLinks.forEach((link, i) => {
    const div = document.createElement('div');
    div.className = 'solid-panel';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'space-between';
    div.style.padding = '0.75rem 1rem';
    div.style.background = 'var(--bg-color)';
    
    div.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.25rem; flex:1; min-width:0;">
        <span style="font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${link.title}</span>
        <span style="font-size:0.8rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${link.url}</span>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="icon-btn open-link-btn" title="Open Link"><i data-lucide="external-link" style="width:18px;height:18px;"></i></button>
        <button class="icon-btn delete-link-btn" title="Delete" style="color:#ef4444;"><i data-lucide="trash-2" style="width:18px;height:18px;"></i></button>
      </div>
    `;

    div.querySelector('.open-link-btn').addEventListener('click', () => {
      const finalUrl = link.url.startsWith('http') ? link.url : 'https://' + link.url;
      if (settings.searchNewTab) {
        window.open(finalUrl, '_blank');
      } else {
        window.location.href = finalUrl;
      }
    });

    div.querySelector('.delete-link-btn').addEventListener('click', async () => {
      if (await customConfirm(`Delete link "${link.title}"?`)) {
        const toDelete = webLinks[i];
        webLinks.splice(i, 1);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session && toDelete.id) {
          await supabase.from('web_links').delete().eq('id', toDelete.id);
        }
        
        saveState();
        renderWebLinks();
      }
    });

    weblinkList.appendChild(div);
  });
  refreshIcons();
}

openWebLinkBtn.addEventListener('click', () => {
  renderWebLinks();
  weblinkModal.classList.add('active');
  waffleModal.classList.remove('active');
});

addWeblinkBtn.addEventListener('click', async () => {
  const title = await customPrompt("Link Title:", "My Link");
  if (!title) return;
  const url = await customPrompt("URL (e.g., example.com):");
  if (!url) return;
  
  const finalUrl = url.startsWith('http') ? url : 'https://' + url;
  const newLink = { title, url: finalUrl };

  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data, error } = await supabase
      .from('web_links')
      .insert([{ ...newLink, user_id: session.user.id }])
      .select();
    if (!error && data) {
       webLinks.push(data[0]);
    } else {
       webLinks.push(newLink);
    }
  } else {
    webLinks.push(newLink);
  }

  saveState();
  renderWebLinks();
});


closeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.modal-overlay').classList.remove('active');
  });
});

window.addEventListener('click', (e) => {
  if(e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  if (await customConfirm("Do you want to sign out?")) {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
  }
});

// --- Tab Switching Logic ---
const tabBtns = document.querySelectorAll('.settings-nav-btn');
const tabPages = document.querySelectorAll('.settings-page');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPages.forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
  });
});

autoLocateBtn.addEventListener('click', () => {
  autoLocateBtn.innerHTML = "Locating...";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      settings.weatherLat = pos.coords.latitude.toFixed(4);
      settings.weatherLon = pos.coords.longitude.toFixed(4);
      wLocationInput.value = "Auto Location";
      autoLocateBtn.innerHTML = `<i data-lucide="map-pin" style="width: 16px; height: 16px;"></i> Auto Locate`;
      refreshIcons();
      handleSettingChange();
    }, () => {
      alert("Location access denied or failed.");
      autoLocateBtn.innerHTML = `<i data-lucide="map-pin" style="width: 16px; height: 16px;"></i> Auto Locate`;
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// --- SEARCH ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const voiceBtn = document.getElementById('voice-search-btn');
const imageBtn = document.getElementById('image-search-btn');

// Dynamic Custom Grid Engine
const engineTrigger = document.getElementById('engine-trigger');
const engineDropdown = document.getElementById('engine-dropdown-grid');
const engineText = document.getElementById('engine-trigger-text');
const engineItems = document.querySelectorAll('.engine-item');

// Dynamically add favicons to each engine item based on its URL
engineItems.forEach(item => {
  try {
    const urlStr = item.dataset.val;
    const url = new URL(urlStr);
    let hostname = url.hostname;
    let iconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    
    // Explicit overrides for engines where Google Favicon API fails
    if (hostname.includes('copilot.microsoft.com')) {
      iconUrl = 'https://copilot.microsoft.com/favicon.ico';
    }
    
    // Setup img and span
    const textStr = item.textContent;
    item.textContent = '';
    
    const img = document.createElement('img');
    img.src = iconUrl;
    img.alt = textStr;
    img.className = 'engine-icon';
    img.onerror = () => { img.style.display = 'none'; }; // Hide if icon fails to load
    
    const span = document.createElement('span');
    span.textContent = textStr;
    
    item.appendChild(img);
    item.appendChild(span);
  } catch(e) {
    console.warn("Could not parse engine URL:", item.dataset.val);
  }
});

function updateEngineUI() {
  document.querySelectorAll('.engine-item').forEach(el => el.classList.remove('active'));
  const activeEl = document.querySelector(`.engine-item[data-val="${settings.defaultSearchEngine}"]`) || engineItems[0];
  if (activeEl) {
    activeEl.classList.add('active');
    engineText.innerHTML = activeEl.innerHTML;
  }
}

engineTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  engineDropdown.style.display = engineDropdown.style.display === 'none' ? 'flex' : 'none';
});

window.addEventListener('click', (e) => {
  if (!e.target.closest('#custom-engine-select-wrapper')) {
    engineDropdown.style.display = 'none';
  }
});

engineItems.forEach(item => {
  item.addEventListener('click', () => {
    settings.defaultSearchEngine = item.dataset.val;
    saveState();
    updateEngineUI();
    engineDropdown.style.display = 'none';
  });
});

window.addEventListener('load', updateEngineUI);

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  const engineBase = settings.defaultSearchEngine;
  const url = engineBase + encodeURIComponent(q);
  if (settings.searchNewTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
});

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  
  voiceBtn.addEventListener('click', () => {
    searchInput.placeholder = "Listening...";
    recognition.start();
  });
  
  recognition.onresult = (event) => {
    searchInput.value = event.results[0][0].transcript;
    searchForm.dispatchEvent(new Event('submit'));
  };
  recognition.onerror = () => { searchInput.placeholder = "Search the web..."; };
  recognition.onend = () => { searchInput.placeholder = "Search the web..."; };
} else {
  voiceBtn.style.display = 'none';
}

const lensForm = document.getElementById('lens-form');
const lensFileInput = document.getElementById('lens-file-input');

imageBtn.addEventListener('click', () => {
  lensFileInput.click();
});

lensFileInput.addEventListener('change', () => {
  if (lensFileInput.files.length > 0) {
    lensForm.submit();
  }
});

// --- BOOKMARKS ---
function renderBookmarks() {
  const grid = document.getElementById('bookmarks-grid');
  grid.innerHTML = '';
  
  bookmarks.forEach((b, i) => {
    let hostname = 'unknown';
    try { hostname = new URL(b.url).hostname; } catch(e) {}
    const iconHTML = `<img src="https://www.google.com/s2/favicons?domain=${hostname}&sz=64" alt="logo" style="width: 24px; height: 24px; border-radius: 4px;" onerror="this.outerHTML='<span style=\\'font-size:1.5rem;\\'>${b.icon || '📌'}</span>'" />`;
    
    const a = document.createElement('a');
    a.href = b.url;
    a.className = 'bookmark-item';
    a.innerHTML = `
      <button class="bookmark-del-btn" title="Remove Bookmark"><i data-lucide="x" style="width:12px; height:12px;"></i></button>
      <div class="bookmark-icon" style="overflow:hidden;">${iconHTML}</div>
      <div class="bookmark-title">${b.title}</div>
    `;

    a.querySelector('.bookmark-del-btn').addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (await customConfirm(`Remove ${b.title}?`)) {
        const toDelete = bookmarks[i];
        bookmarks.splice(i, 1);

        const { data: { session } } = await supabase.auth.getSession();
        if (session && toDelete.id) {
          await supabase.from('bookmarks').delete().eq('id', toDelete.id);
        }

        saveState();
        renderBookmarks();
      }
    });

    grid.appendChild(a);
  });
  refreshIcons();
}

document.getElementById('add-curr-bookmark').addEventListener('click', async () => {
  const title = await customPrompt("Bookmark Title:");
  if (!title) return;
  const url = await customPrompt("URL (e.g., https://example.com):");
  if (!url) return;
  
  const finalUrl = url.startsWith('http') ? url : 'https://' + url;
  const newBookmark = { title, url: finalUrl, icon: '📌', category: 'Share' };

  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ ...newBookmark, user_id: session.user.id }])
      .select();
    if (!error && data) {
      bookmarks.push(data[0]);
    } else {
      bookmarks.push(newBookmark);
    }
  } else {
    bookmarks.push(newBookmark);
  }
  
  renderBookmarks();
  saveState();
  waffleModal.classList.remove('active');
});


// --- WEATHER (Open-Meteo) ---
const getWeatherIcon = (code) => {
  if (code <= 1) return '☀️'; 
  if (code <= 3) return '⛅'; 
  if (code <= 48) return '🌫️'; 
  if (code <= 57) return '🌧️'; 
  if (code <= 67) return '🌧️'; 
  if (code <= 77) return '❄️'; 
  if (code <= 82) return '🌦️'; 
  if (code <= 86) return '🌨️'; 
  return '⛈️'; 
};

async function fetchWeather() {
  try {
    const lat = settings.weatherLat || '40.71';
    const lon = settings.weatherLon || '-74.00';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.current) {
      document.getElementById('weather-text').textContent = `${data.current.temperature_2m}°C`;
      
      const curr = data.current;
      const lText = wLocationInput.value ? wLocationInput.value + ' | ' : '';
      document.getElementById('weather-current-details').innerHTML = `
        <div style="width:100%; margin-bottom:1rem; font-weight:bold; color:var(--text-secondary)">${lText}Current Weather</div>
        <div class="weather-detail-item">
          <span class="weather-detail-label">Current Temp</span>
          <span class="weather-detail-val">${curr.temperature_2m}°C</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-label">Feels Like</span>
          <span class="weather-detail-val">${curr.apparent_temperature}°C</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-label">Humidity</span>
          <span class="weather-detail-val">${curr.relative_humidity_2m}%</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-label">Wind Speed</span>
          <span class="weather-detail-val">${curr.wind_speed_10m} km/h</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-label">Precipitation</span>
          <span class="weather-detail-val">${curr.precipitation} mm</span>
        </div>
      `;
    }
    
    if (data.daily) {
       const grid = document.getElementById('weather-forecast-grid');
       grid.innerHTML = '';
       const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
       data.daily.time.forEach((t, i) => {
         const d = new Date(t);
         const dayName = i === 0 ? 'Today' : days[d.getDay()];
         grid.innerHTML += `
           <div class="forecast-card">
             <div class="forecast-day">${dayName}</div>
             <div class="forecast-icon">${getWeatherIcon(data.daily.weather_code[i])}</div>
             <div class="forecast-temps">${data.daily.temperature_2m_max[i]}° <span>${data.daily.temperature_2m_min[i]}°</span></div>
           </div>
         `;
       });
    }
  } catch (e) {
    document.getElementById('weather-text').textContent = "Weather Error";
  }
}

// --- SYSTEM INFO ---
async function fetchSystemInfo() {
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    document.getElementById('ip4-val').textContent = ipData.ip;
    
    const locRes = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
    const locData = await locRes.json();
    if (!locData.error) {
      document.getElementById('ip6-val').textContent = locData.ip || 'N/A';
      document.getElementById('isp-val').textContent = locData.org || 'Unknown';
      document.getElementById('loc-val').textContent = `${locData.city}, ${locData.region}, ${locData.country_name}`;
      document.getElementById('tz-val').textContent = locData.timezone;
    }
  } catch (e) {
    console.warn("System info fetch failed.");
  }
}

initSession();
fetchSystemInfo();
