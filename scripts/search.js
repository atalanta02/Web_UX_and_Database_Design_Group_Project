// 1) Connect to Supabase
const SUPABASE_URL = "https://jtqkbhgucspgklccgawd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cWtiaGd1Y3NwZ2tsY2NnYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjE4NTIsImV4cCI6MjA3NTU5Nzg1Mn0.fBiGoem1tfS2RInqdBv9EekdIdw5ydQIPUl_JewMJ_M";

let supabaseClient;
let currentType = "all";

// == INIT ==
window.addEventListener("DOMContentLoaded", async () => {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );

  await fetchMovies();

  const searchInput = document.getElementById("searchInput");

  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchMovies, 300);
  });
});

// == FETCH MOVIES ==
async function fetchMovies() {
  const tableBody = document.getElementById("movie-table-body");
  const search = document.getElementById("searchInput").value;

  tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  let query = supabaseClient
    .from("movie")
    .select("id, title, description, image_url, type_id")
    .order("id", { ascending: true });

  if (currentType !== "all") {
    const typeValue = currentType === "movie" ? 1 : 2;
    query = query.eq("type_id", typeValue);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    tableBody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    return;
  }

  renderMovies(data);
}

// == RENDER TABLE ==
function renderMovies(data) {
  const tableBody = document.getElementById("movie-table-body");

  if (!data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">No results found</td></tr>';
    return;
  }

  tableBody.innerHTML = "";

  data.forEach((movie) => {
    const row = document.createElement("tr");

    row.innerHTML = `
          <td>${movie.id}</td>
          <td><img src="${movie.image_url || ""}" width="50"></td>
          <td>${movie.title ?? ""}</td>
          <td>${movie.type_id == 1 ? "Movie" : "TV Show"}</td>
          <td>
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
          </td>
        `;

    row.querySelector(".btn-edit").addEventListener("click", () => {
      window.location.href = `index.html#movie-${movie.id}`;
    });

    row.querySelector(".btn-delete").addEventListener("click", async (e) => {
      const btn = e.target;

      if (!confirm(`Delete movie ID ${movie.id}?`)) return;

      btn.disabled = true;

      const { data: deletedData, error } = await supabaseClient
        .from("movie")
        .delete()
        .eq("id", movie.id)
        .select("id");

      if (error) {
        alert("Delete failed: " + error.message);
        btn.disabled = false;
        return;
      }

      if (!deletedData || deletedData.length === 0) {
        alert("Movie was not deleted.");
        btn.disabled = false;
        return;
      }

      row.remove();
    });

    tableBody.appendChild(row);
  });
}

function setType(type) {
  currentType = type;
  fetchMovies();
}

function applyFilters() {
  fetchMovies();
}

function toggleMenu() {
  const navbar = document.querySelector(".navbar");
  const header = document.querySelector(".header");

  navbar.classList.toggle("active");
  header.classList.toggle("menu-open");
}
