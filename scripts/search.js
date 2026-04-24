// 1) Connect to Supabase
const SUPABASE_URL = "https://jtqkbhgucspgklccgawd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cWtiaGd1Y3NwZ2tsY2NnYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjE4NTIsImV4cCI6MjA3NTU5Nzg1Mn0.fBiGoem1tfS2RInqdBv9EekdIdw5ydQIPUl_JewMJ_M";

let supabaseClient;
let currentType = "all";
let currentSort = null;

// == INIT ==
window.addEventListener("DOMContentLoaded", async () => {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );
  await fetchMovies();

  // search with debounce
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
    .select("id, title, description, image_url, type_id");

  if (currentSort === "az") {
    query = query.order("title", { ascending: true });
  } else if (currentSort === "za") {
    query = query.order("title", { ascending: false });
  } else {
    query = query.order("id", { ascending: true }); // default
  }

  // filter by type
  if (currentType !== "all") {
    const typeValue = currentType === "movie" ? 1 : 2;
    query = query.eq("type_id", typeValue);
  }

  // search filter
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
        `;
    tableBody.appendChild(row);
  });
}

// == FILTER BUTTONS ==
function setType(type) {
  currentType = type;
  fetchMovies();
}

function toggleMenu() {
  const navbar = document.querySelector(".navbar");
  const header = document.querySelector(".header");

  navbar.classList.toggle("active");
  header.classList.toggle("menu-open");
}

function setSort(sort) {
  currentSort = sort;

  document.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  event.target.classList.add("active");

  fetchMovies();
}
