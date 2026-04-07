const supabaseLib = window.supabase || window.Supabase || window.supabaseJs || null;
const supabase = supabaseLib?.createClient?.(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const createForm = document.getElementById('create-movie-form');
const editForm = document.getElementById('update-movie-form');
const movieTableBody = document.getElementById('movie-table-body');
const messageBox = document.getElementById('crud-message');

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('error', (event) => {
  if (messageBox) {
    messageBox.textContent = 'JavaScript error: ' + (event.message || event.error?.message || 'unknown error');
    messageBox.classList.add('error');
  }
  console.error('Unhandled JS error:', event.error || event.message, event);
});

async function init() {
  if (!supabase) {
    showMessage('Supabase client failed to load. Check your internet or the CDN script import.', true);
    return;
  }

  if (!createForm || !editForm || !movieTableBody || !messageBox) {
    console.error('Index page missing required CRUD elements.');
    return;
  }

  createForm.addEventListener('submit', handleCreate);
  editForm.addEventListener('submit', handleUpdate);
  document.getElementById('cancel-edit').addEventListener('click', () => {
    editForm.reset();
    editForm.classList.add('hidden');
  });

  await loadMovies();
}

async function loadMovies() {
  const { data, error } = await supabase.from('movie').select('*, type(category)').order('id');
  if (error) {
    showMessage('Unable to load movies: ' + error.message, true);
    return;
  }

  if (!data || !data.length) {
    movieTableBody.innerHTML = '<tr><td colspan="5">No movies found yet.</td></tr>';
    showMessage('No movies currently exist in the database. Add a movie to populate the table.', false);
    return;
  }

  movieTableBody.innerHTML = data.map(renderMovieRow).join('');
  showMessage('Movies loaded successfully.', false);
}

function renderMovieRow(movie) {
  const imageUrl = movie.image_url || 'https://via.placeholder.com/50x75?text=No+Image';
  const category = movie.Type?.category || 'Unknown';

  return `
    <tr>
      <td>${movie.id}</td>
      <td><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(movie.title)}" style="width: 50px; height: 75px; object-fit: cover;"></td>
      <td>${escapeHtml(movie.title)}</td>
      <td>${escapeHtml(category)}</td>
      <td>
        <button type="button" class="crud-action" onclick="editMovie(${movie.id})">Edit</button>
        <button type="button" class="crud-action delete" onclick="deleteMovie(${movie.id})">Delete</button>
      </td>
    </tr>
  `;
}

async function handleCreate(event) {
  event.preventDefault();
  const title = document.getElementById('create-title').value.trim();
  const type_id = parseInt(document.querySelector('input[name="create-type"]:checked').value, 10);
  const image_url = document.getElementById('create-image-url').value.trim();
  const description = document.getElementById('description').value.trim();

  if (!title || !type_id) {
    showMessage('Please supply a title and type.', true);
    return;
  }

  const { error } = await supabase.from('Movie').insert([{ title, type_id, image_url: image_url || null, description: description || null }]);
  if (error) {
    showMessage('Unable to add movie: ' + error.message, true);
    return;
  }

  createForm.reset();
  await loadMovies();
  showMessage('Movie added successfully.');
}

window.editMovie = async function (movieId) {
  const { data, error } = await supabase.from('Movie').select('*').eq('id', movieId).single();
  if (error) {
    showMessage('Unable to load movie for editing: ' + error.message, true);
    return;
  }

  document.getElementById('edit-id').value = data.id;
  document.getElementById('edit-title').value = data.title;
  document.querySelector(`input[name="edit-type"][value="${data.type_id}"]`).checked = true;
  document.getElementById('edit-image-url').value = data.image_url || '';
  document.getElementById('edit-description')?.value = data.description || '';
  editForm.classList.remove('hidden');
  window.scrollTo({ top: editForm.offsetTop - 20, behavior: 'smooth' });
};

async function handleUpdate(event) {
  event.preventDefault();
  const id = parseInt(document.getElementById('edit-id').value, 10);
  const title = document.getElementById('edit-title').value.trim();
  const type_id = parseInt(document.querySelector('input[name="edit-type"]:checked').value, 10);
  const image_url = document.getElementById('edit-image-url').value.trim();
  const description = document.getElementById('edit-description')?.value.trim() || null;

  if (!id || !title || !type_id) {
    showMessage('Please fill in the edit form completely.', true);
    return;
  }

  const { error } = await supabase.from('Movie').update({ title, type_id, image_url: image_url || null, description }).eq('id', id);
  if (error) {
    showMessage('Unable to update movie: ' + error.message, true);
    return;
  }

  editForm.reset();
  editForm.classList.add('hidden');
  await loadMovies();
  showMessage('Movie updated successfully.');
}

window.deleteMovie = async function (movieId) {
  if (!confirm('Delete this movie?')) return;

  const { error } = await supabase.from('Movie').delete().eq('id', movieId);
  if (error) {
    showMessage('Unable to remove movie: ' + error.message, true);
    return;
  }

  await loadMovies();
  showMessage('Movie deleted successfully.');
};

function showMessage(message, isError = false) {
  messageBox.textContent = message;
  messageBox.classList.toggle('error', isError);
  messageBox.classList.toggle('success', !isError);
}

function escapeHtml(text) {
  return String(text).replace(/[&"'<>]/g, (char) => {
    const escapes = {
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
      '<': '&lt;',
      '>': '&gt;'
    };
    return escapes[char];
  });
}
