const supabase = window.supabase?.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
const tvContainer = document.querySelector('.movies-grid');

window.addEventListener('DOMContentLoaded', initTvGrid);

async function initTvGrid() {
  if (!window.supabase) return;
  if (!tvContainer) return;
  await loadTvShows();
}

async function loadTvShows() {
  const { data, error } = await supabase.from('movie').select('*').eq('type_id', 2).order('id');
  if (error) {
    console.error('Unable to load TV shows:', error);
    return;
  }
  tvContainer.innerHTML = data.length ? data.map(renderTvItem).join('') : '<p>No TV shows found.</p>';
}

function renderTvItem(tv) {
  const imageUrl = tv.image_url || 'https://via.placeholder.com/280x350?text=No+Image';
  return `
    <div class="movie-card">
      <div class="movie-poster">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(tv.title)}">
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${escapeHtml(tv.title)}</h3>
        <p class="movie-description">${escapeHtml(tv.description || 'No description available.')}</p>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  return String(text).replace(/[&"'<>]/g, (char) => {
    const escapes = { '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' };
    return escapes[char];
  });
}
