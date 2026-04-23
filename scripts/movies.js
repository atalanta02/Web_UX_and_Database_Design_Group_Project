// 1) Connect to Supabase
const SUPABASE_URL = "https://jtqkbhgucspgklccgawd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cWtiaGd1Y3NwZ2tsY2NnYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjE4NTIsImV4cCI6MjA3NTU5Nzg1Mn0.fBiGoem1tfS2RInqdBv9EekdIdw5ydQIPUl_JewMJ_M";

let supabaseClient;
let editingMovie = null;
let moviesTableName = null;

window.addEventListener("DOMContentLoaded", async () => {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );
  moviesTableName = await resolveMoviesTableName();
  console.log("Resolved table name:", moviesTableName);
  await loadMovies();
});

async function resolveMoviesTableName() {
  const candidateNames = ["movie", "Movie"];
  for (const name of candidateNames) {
    const { error } = await supabaseClient.from(name).select("id").limit(1);
    if (!error) return name;
    if (
      !error.message ||
      !/could not find the table|relation .* does not exist|table .* does not exist/i.test(
        error.message,
      )
    ) {
      break;
    }
  }
  return "movie";
}

// 2) Fetch movies from Supabase and display in grid
async function loadMovies() {
  console.log("Loading movies...");
  const container = document.getElementById("movies-container");

  container.innerHTML = '<div class="loading">Loading movies...</div>';

  const { data, error } = await supabaseClient
    .from(moviesTableName)
    .select("id, title, description, image_url, type_id")
    .eq("type_id", 1) // Filter for movies only
    .order("id", { ascending: true });

  console.log("Data:", data, "Error:", error);

  if (error) {
    container.innerHTML =
      '<div class="error">Error loading movies: ' + error.message + "</div>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="no-data">No movies found</div>';
    return;
  }

  container.innerHTML = "";
  data.forEach((movie) => {
    const item = document.createElement("div");
    item.className = "movie-item";

    item.innerHTML = `
            <div class="movie-poster">
              <img src="${movie.image_url || ""}" alt="${movie.title}" />
              <div class="movie-overlay">
                <h3 class="poster-title">${movie.title ?? ""}</h3>
                <p class="poster-description">${movie.description ?? ""}</p>
                <a class="manage-button" href="index.html#movie-${movie.id}">Manage</a>
              </div>
            </div>
          `;

    container.appendChild(item);
  });
  console.log("Movies loaded");
}

function toggleMenu() {
  const navbar = document.querySelector(".navbar");
  const header = document.querySelector(".header");

  navbar.classList.toggle("active");
  header.classList.toggle("menu-open");
}
