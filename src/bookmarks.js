import { createIcons, BookmarkPlus, Plus, X, Trash2, Edit, Bookmark, Download, Upload } from 'lucide';
import { supabase } from './supabaseClient.js';
import { checkSession } from './auth.js';
import { customPrompt, customConfirm } from './dialogs.js';
import { injectSpeedInsights } from '@vercel/speed-insights';

const lucideIcons = { BookmarkPlus, Plus, X, Trash2, Edit, Bookmark, Download, Upload };

createIcons({
  icons: lucideIcons
});

// Initialize Vercel Speed Insights
injectSpeedInsights();

const DEFAULT_CATEGORIES = ['Account', 'Bank', 'Dev', 'Social Media', 'Finance', 'Health', 'Entertainment', 'Shopping', 'Tools', 'AI', 'Share'];

let bookmarks = [];
let categories = [];
let activeCategory = 'Dev';

async function init() {
  const session = await checkSession();
  
  if (session) {
    const userId = session.user.id;

    // Load Bookmarks from DB
    const { data: dbBookmarks } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (dbBookmarks) bookmarks = dbBookmarks;

    // Load Categories from Profile Settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single();
    
    if (profile && profile.settings && profile.settings.homepage_categories) {
       categories = profile.settings.homepage_categories;
    } else {
       categories = [...DEFAULT_CATEGORIES];
    }
  } else {
    bookmarks = JSON.parse(localStorage.getItem('hp_bookmarks')) || [];
    categories = JSON.parse(localStorage.getItem('hp_categories')) || [...DEFAULT_CATEGORIES];
  }

  // Fallback defaults if empty
  if (bookmarks.length === 0) {
    bookmarks = [
      { title: 'YouTube', url: 'https://youtube.com', icon: '▶️', category: 'Entertainment' },
      { title: 'GitHub', url: 'https://github.com', icon: '🐙', category: 'Dev' },
      { title: 'Twitter', url: 'https://twitter.com', icon: '🐦', category: 'Social Media' }
    ];
  }

  // Migrate old non-categorized bookmarks
  bookmarks = bookmarks.map(b => {
    if (!b.category) b.category = 'Share'; 
    return b;
  });

  if (!categories.includes(activeCategory)) activeCategory = categories[0] || 'Share';

  renderCategories();
  renderBookmarks();
}

async function saveState() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Categories are saved in profiles.settings
    const userId = session.user.id;
    const { data: profile } = await supabase.from('profiles').select('settings').eq('id', userId).single();
    const updatedSettings = { ...(profile?.settings || {}), homepage_categories: categories };
    
    await supabase.from('profiles').upsert({ id: userId, settings: updatedSettings });
    // Note: Bookmarks are handled individually in add/delete/edit
  } else {
    localStorage.setItem('hp_bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('hp_categories', JSON.stringify(categories));
  }
}


function renderCategories() {
  const listEl = document.getElementById('category-list');
  listEl.innerHTML = '';
  
  categories.forEach(cat => {
    const count = bookmarks.filter(b => b.category === cat).length;
    
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '0.25rem';
    
    const btn = document.createElement('button');
    btn.className = `category-btn ${cat === activeCategory ? 'active' : ''}`;
    btn.innerHTML = `
      <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${cat}</span>
      <span class="category-badge">${count}</span>
    `;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      renderCategories();
      renderBookmarks();
    });
    wrapper.appendChild(btn);
    
      const editCatBtn = document.createElement('button');
      editCatBtn.className = 'icon-btn';
      editCatBtn.style.padding = '0.5rem';
      editCatBtn.style.color = 'var(--text-secondary)';
      editCatBtn.title = "Rename Category";
      editCatBtn.innerHTML = `<i data-lucide="edit" style="width:16px;height:16px;"></i>`;
      
      editCatBtn.addEventListener('click', async () => {
        const newName = await customPrompt("Rename Category:", cat);
        if (newName && newName !== cat && !categories.includes(newName)) {
          // Update bookmarks in this category
          bookmarks = bookmarks.map(b => b.category === cat ? { ...b, category: newName } : b);
          // Update categories list
          const index = categories.indexOf(cat);
          if (index !== -1) categories[index] = newName;
          
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.from('bookmarks').update({ category: newName }).eq('user_id', session.user.id).eq('category', cat);
          }
          
          if (activeCategory === cat) activeCategory = newName;
          saveState();
          renderCategories();
          renderBookmarks();
        }
      });
      wrapper.appendChild(editCatBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.style.padding = '0.5rem';
      delBtn.style.color = 'var(--text-secondary)';
      delBtn.title = "Delete Category";
      delBtn.innerHTML = `<i data-lucide="x" style="width:18px;height:18px;"></i>`;
      
      delBtn.addEventListener('mouseover', () => delBtn.style.color = '#ef4444');
      delBtn.addEventListener('mouseout', () => delBtn.style.color = 'var(--text-secondary)');
      
      delBtn.addEventListener('click', async () => {
        const fallback = categories.find(c => c !== cat);
        if (await customConfirm(`Delete category "${cat}"? Any bookmarks inside will be moved to "${fallback}".`)) {
           bookmarks = bookmarks.map(b => b.category === cat ? { ...b, category: fallback } : b);
           categories = categories.filter(c => c !== cat);
           
           const { data: { session } } = await supabase.auth.getSession();
           if (session) {
             // Bulk update bookmarks in DB
             await supabase.from('bookmarks').update({ category: fallback }).eq('user_id', session.user.id).eq('category', cat);
           }

           if (activeCategory === cat) activeCategory = fallback;
           saveState();
           renderCategories();
           renderBookmarks();
        }
      });

      wrapper.appendChild(delBtn);
    
    listEl.appendChild(wrapper);
  });
  createIcons({ icons: lucideIcons });
}

function renderBookmarks() {
  const container = document.getElementById('bookmarks-list-container');
  container.innerHTML = '';
  
  const filtered = bookmarks.filter(b => b.category === activeCategory);
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div id="empty-state">
        <i data-lucide="bookmark" style="width:48px;height:48px; opacity:0.5;"></i>
        <p>No bookmarks in "${activeCategory}"</p>
      </div>
    `;
    createIcons({ icons: { Bookmark } });
    return;
  }
  
  filtered.forEach(b => {
    const div = document.createElement('div');
    div.className = 'bookmark-grid-item';
    
    let hostname = 'unknown';
    try { hostname = new URL(b.url).hostname; } catch(e) {}
    const iconHTML = `<img src="https://www.google.com/s2/favicons?domain=${hostname}&sz=64" alt="logo" style="width: 28px; height: 28px; border-radius: 4px;" onerror="this.outerHTML='<span style=\\'font-size:1.5rem;\\'>${b.icon || '📌'}</span>'" />`;
    
    div.innerHTML = `
      <div class="b-icon">${iconHTML}</div>
      <div class="b-details">
        <a href="${b.url}" target="_blank" class="b-title" title="${b.title}" style="text-decoration:none;">${b.title}</a>
        <span class="b-url" title="${b.url}">${b.url}</span>
      </div>
      <div class="b-actions">
        <button class="icon-btn edit-btn" title="Edit"><i data-lucide="edit" style="width:14px; height:14px;"></i></button>
        <button class="icon-btn delete-btn" title="Delete"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
      </div>
    `;
    
    div.querySelector('.delete-btn').addEventListener('click', async () => {
      if(await customConfirm(`Delete ${b.title}?`)) {
        bookmarks = bookmarks.filter(x => x !== b);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session && b.id) {
          await supabase.from('bookmarks').delete().eq('id', b.id);
        }

        saveState();
        renderCategories();
        renderBookmarks();
      }
    });


    div.querySelector('.edit-btn').addEventListener('click', async () => {
      const newTitle = await customPrompt("New Title:", b.title);
      if (!newTitle) return;
      const newUrl = await customPrompt("New URL:", b.url);
      if (!newUrl) return;
      const newCat = await customPrompt("Category:", b.category);
      if (!newCat) return;

      b.title = newTitle;
      b.url = newUrl;
      b.category = newCat;

      if (!categories.includes(newCat)) {
        categories.push(newCat);
        saveState();
        renderCategories();
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session && b.id) {
        await supabase.from('bookmarks').update({ 
          title: b.title, 
          url: b.url, 
          category: b.category 
        }).eq('id', b.id);
      }

      saveState();
      renderBookmarks();
      renderCategories(); // Update counts
    });


    container.appendChild(div);
  });
  createIcons({ icons: lucideIcons });
}

const addCategoryForm = document.getElementById('add-category-form');
addCategoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('new-category-name');
  const cat = input.value.trim();
  if (cat && !categories.includes(cat)) {
    categories.push(cat);
    activeCategory = cat;
    saveState();
    renderCategories();
    renderBookmarks();
    input.value = '';
  }
});

document.getElementById('add-bookmark-btn').addEventListener('click', async () => {
  const title = await customPrompt(`Add Bookmark to '${activeCategory}' - Title:`);
  if (!title) return;
  const url = await customPrompt("URL (e.g., https://example.com):");
  if (!url) return;
  
  const finalUrl = url.startsWith('http') ? url : 'https://' + url;
  const newBookmark = { title, url: finalUrl, icon: '📌', category: activeCategory };

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
  
  saveState();
  renderCategories();
  renderBookmarks();
});


// --- IMPORT / EXPORT ---

const importInput = document.getElementById('import-input');
const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');

importBtn.addEventListener('click', () => importInput.click());

exportBtn.addEventListener('click', async () => {
  const format = await customPrompt("Export format: type 'json' or 'html' (Standard)", "html");
  if (!format) return;
  
  if (format.toLowerCase() === 'json') {
    exportToJSON();
  } else {
    exportToHTML();
  }
});

importInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (event) => {
    const content = event.target.result;
    if (file.name.endsWith('.json')) {
      await importFromJSON(content);
    } else {
      await importFromHTML(content);
    }
    importInput.value = ''; // Reset
  };
  reader.readAsText(file);
});

function exportToJSON() {
  const data = {
    bookmarks,
    categories,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadFile(blob, 'bookmarks_backup.json');
}

function exportToHTML() {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read correctly by browsers and this app. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  categories.forEach(cat => {
    const catBookmarks = bookmarks.filter(b => b.category === cat);
    if (catBookmarks.length === 0) return;
    
    html += `    <DT><H3>${cat}</H3>\n    <DL><p>\n`;
    catBookmarks.forEach(b => {
      html += `        <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(Date.now()/1000)}">${b.title}</A>\n`;
    });
    html += `    </DL><p>\n`;
  });

  html += `</DL><p>`;
  
  const blob = new Blob([html], { type: 'text/html' });
  downloadFile(blob, 'bookmarks_export.html');
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function importFromJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (data.bookmarks && Array.isArray(data.bookmarks)) {
      if (await customConfirm(`Import ${data.bookmarks.length} bookmarks? This will merge with existing ones.`)) {
        bookmarks = [...bookmarks, ...data.bookmarks];
        if (data.categories && Array.isArray(data.categories)) {
          data.categories.forEach(c => {
            if (!categories.includes(c)) categories.push(c);
          });
        }
        await saveState();
        renderCategories();
        renderBookmarks();
      }
    }
  } catch (e) {
    alert("Error parsing JSON file.");
  }
}

async function importFromHTML(htmlText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const importedBookmarks = [];
    
    // Find all <a> tags
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
      const url = link.getAttribute('href');
      const title = link.textContent || "Untitled";
      
      // Try to find the nearest preceding H3 for category
      let category = 'Share';
      let prev = link.closest('dl');
      if (prev) {
        let header = prev.previousElementSibling;
        if (header && header.tagName === 'DT') header = header.querySelector('h3');
        if (header && header.tagName === 'H3') {
           category = header.textContent;
        } else {
          // Alternative Netscape layout
          let sibling = prev.previousElementSibling;
          if (sibling && sibling.tagName === 'H3') category = sibling.textContent;
        }
      }
      
      importedBookmarks.push({ title, url, icon: '📌', category });
    });

    if (importedBookmarks.length > 0) {
      if (await customConfirm(`Detected ${importedBookmarks.length} bookmarks. Import them?`)) {
        importedBookmarks.forEach(b => {
          bookmarks.push(b);
          if (!categories.includes(b.category)) categories.push(b.category);
        });
        await saveState();
        renderCategories();
        renderBookmarks();
      }
    } else {
      alert("No bookmarks found in the HTML file.");
    }
  } catch (e) {
    alert("Error parsing HTML file.");
    console.error(e);
  }
}

init();
