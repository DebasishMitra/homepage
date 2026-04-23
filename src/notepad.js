import { createIcons, BookOpen, Plus, X, Trash2, Edit3 } from 'lucide';
import { supabase } from './supabaseClient.js';
import { checkSession } from './auth.js';
import { customConfirm } from './dialogs.js';

createIcons({
  icons: { BookOpen, Plus, X, Trash2, Edit3 }
});

let notes = [];
let activeNoteId = null;

const listContainer = document.getElementById('note-list');
const editorArea = document.getElementById('editor-area');
const editorEmpty = document.getElementById('editor-empty');
const titleInput = document.getElementById('editor-title');
const bodyInput = document.getElementById('editor-body');

async function init() {
  const session = await checkSession();
  
  if (session) {
    const userId = session.user.id;

    // Load Notes from DB
    const { data: dbNotes } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (dbNotes) notes = dbNotes;
    
    // Migration framework: Convert old metadata notepad to true notes
    const userMetadata = session.user.user_metadata;
    if (notes.length === 0 && userMetadata.homepage_settings && userMetadata.homepage_settings.notepadText) {
       const migrated = createNoteObj("Migrated Note", userMetadata.homepage_settings.notepadText);
       await supabase.from('notes').insert([{ ...migrated, user_id: userId }]);
       notes.push(migrated);
    }
  } else {
    notes = JSON.parse(localStorage.getItem('hp_notes')) || [];
    const localSett = JSON.parse(localStorage.getItem('hp_settings'));
    if (notes.length === 0 && localSett && localSett.notepadText) {
       notes.push(createNoteObj("Migrated Note", localSett.notepadText));
    }
  }


  // Ensure initial sorting
  notes.sort((a,b) => b.updatedAt - a.updatedAt);
  
  renderSidebar();
}

function createNoteObj(title, text) {
  return {
    id: Date.now().toString() + Math.floor(Math.random()*1000),
    title: title,
    content: text,
    updatedAt: Date.now()
  };
}

async function saveState() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Individual notes are handled in handleEdit, create, and delete
  } else {
    localStorage.setItem('hp_notes', JSON.stringify(notes));
  }
}


function formatDate(ms) {
   const d = new Date(ms);
   return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function renderSidebar() {
  listContainer.innerHTML = '';
  
  // Sort reverse-chronological by updated date
  notes.sort((a,b) => b.updatedAt - a.updatedAt);
  
  if (notes.length === 0) {
    editorArea.style.display = 'none';
    editorEmpty.style.display = 'flex';
    return;
  }
  
  notes.forEach(n => {
    const btn = document.createElement('div');
    btn.className = `note-list-item ${n.id === activeNoteId ? 'active' : ''}`;
    
    const previewTxt = n.content.replace(/\n/g, ' ').substring(0, 40) || 'No content...';
    const titleTxt = n.title || 'Untitled Note';
    
    btn.innerHTML = `
      <div class="n-title">${titleTxt}</div>
      <div class="n-preview">${previewTxt}</div>
      <div class="n-date">${formatDate(n.updatedAt)}</div>
    `;
    
    btn.addEventListener('click', () => {
      openNote(n.id);
    });
    
    listContainer.appendChild(btn);
  });
}

function openNote(id) {
  activeNoteId = id;
  const n = notes.find(x => x.id === id);
  if (!n) return;
  
  editorEmpty.style.display = 'none';
  editorArea.style.display = 'flex';
  
  titleInput.value = n.title;
  bodyInput.value = n.content;
  
  renderSidebar(); 
}

let saveTimeout = null;

function handleEdit() {
  if (!activeNoteId) return;
  const n = notes.find(x => x.id === activeNoteId);
  if (n) {
    n.title = titleInput.value;
    n.content = bodyInput.value;
    n.updatedAt = Date.now();
    
    renderSidebar();

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && n.id) {
        await supabase.from('notes').upsert({
          id: n.id,
          user_id: session.user.id,
          title: n.title,
          content: n.content,
          updated_at: new Date().toISOString()
        });
      }
      saveState();
    }, 1000);

  }
}

titleInput.addEventListener('input', handleEdit);
bodyInput.addEventListener('input', handleEdit);

document.getElementById('create-note-btn').addEventListener('click', async () => {
  const newNote = {
    id: Date.now().toString() + Math.random().toString().substring(2,6),
    title: '',
    content: '',
    updatedAt: Date.now()
  };

  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        id: newNote.id,
        user_id: session.user.id,
        title: newNote.title,
        content: newNote.content
      }])
      .select();
    if (!error && data) {
       notes.unshift(data[0]);
       activeNoteId = data[0].id;
    } else {
       notes.unshift(newNote);
       activeNoteId = newNote.id;
    }
  } else {
    notes.unshift(newNote);
    activeNoteId = newNote.id;
  }

  saveState();
  renderSidebar();
  openNote(activeNoteId);
});


document.getElementById('delete-note-btn').addEventListener('click', async () => {
  if (!activeNoteId) return;
  if (await customConfirm("Are you sure you want to delete this note?")) {
    const toDeleteId = activeNoteId;
    notes = notes.filter(x => x.id !== activeNoteId);
    activeNoteId = null;
    editorArea.style.display = 'none';
    editorEmpty.style.display = 'flex';
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('notes').delete().eq('id', toDeleteId);
    }

    saveState();
    renderSidebar();
  }
});


init();
