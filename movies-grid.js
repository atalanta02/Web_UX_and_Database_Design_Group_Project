const supabase = window.supabase?.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
const moviesContainer = document.querySelector('.movies-grid');

window.addEventListener('DOMContentLoaded', initMoviesGrid);

async function initMoviesGrid() {
  if (!window.supabase) return;
  if (!moviesContainer) return;
  await loadMovies();
}

async function loadMovies() {
  const { data, error } = await supabase.from('movie').select('*').eq('type_id', 1).order('id');
  if (error) {
    console.error('Unable to load movies:', error);
    return;
  }
  moviesContainer.innerHTML = data.length ? data.map(renderMovieItem).join('') : '<p>No movies found.</p>';
}

function renderMovieItem(movie) {
  const imageUrl = movie.image_url || 'https://via.placeholder.com/280x350?text=No+Image';
  return `
    <div class="movie-card">
      <div class="movie-poster">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(movie.title)}">
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
        <p class="movie-description">${escapeHtml(movie.description || 'No description available.')}</p>
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
