// 1) Connect to Supabase
const SUPABASE_URL = "https://jtqkbhgucspgklccgawd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cWtiaGd1Y3NwZ2tsY2NnYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjE4NTIsImV4cCI6MjA3NTU5Nzg1Mn0.fBiGoem1tfS2RInqdBv9EekdIdw5ydQIPUl_JewMJ_M";

let supabaseClient;
let editingMovie = null;

window.addEventListener("DOMContentLoaded", async () => {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );

  await loadMovies();

  document
    .getElementById("create-movie-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      addMovie();
    });

  document
    .getElementById("update-movie-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      addMovie();
    });

  document.getElementById("cancel-edit").addEventListener("click", () => {
    editingMovie = null;

    document.getElementById("update-movie-form").classList.add("hidden");
    document.getElementById("create-movie-form").classList.remove("hidden");

    document.getElementById("crud-message").textContent = "";
  });
});

async function loadMovies() {
  const tableBody = document.getElementById("movie-table-body");
  const statusEl = document.getElementById("crud-message");

  tableBody.innerHTML = '<tr><td colspan="6">Loading data…</td></tr>';

  const { data, error } = await supabaseClient
    .from("movie")
    .select("id, title, description, image_url, type_id")
    .order("id", { ascending: true });

  if (error) {
    tableBody.innerHTML = '<tr><td colspan="6">Error loading data</td></tr>';
    statusEl.textContent = error.message;
    return;
  }

  if (!data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No movies found</td></tr>';
    statusEl.textContent = "Tip: add movies in Supabase Table Editor.";
    return;
  }

  tableBody.innerHTML = "";

  data.forEach((movie) => {
    const row = document.createElement("tr");
    row.id = `movie-${movie.id}`;

    row.innerHTML = `
          <td>${movie.id}</td>
          <td><img src="${movie.image_url || ""}" width="50" height="50"></td>
          <td>${movie.title ?? ""}</td>
          <td>${movie.type_id == 1 ? "Movie" : "TV Show"}</td>
        `;

    const actionsTd = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("btn-edit");

    editBtn.addEventListener("click", () => {
      editMovie(
        movie.id,
        movie.title || "",
        movie.description || "",
        movie.image_url || "",
        movie.type_id || "",
      );
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("btn-delete");

    deleteBtn.addEventListener("click", () => {
      deleteMovie(movie.id, deleteBtn);
    });

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);

    row.appendChild(actionsTd);
    tableBody.appendChild(row);
  });

  statusEl.textContent = "";
}

async function deleteMovie(movieId, btnEl) {
  const statusEl = document.getElementById("crud-message");

  if (!confirm(`Delete movie ID ${movieId}?`)) return;

  btnEl.disabled = true;
  statusEl.textContent = "Deleting...";

  try {
    const { data, error } = await supabaseClient
      .from("movie")
      .delete()
      .eq("id", movieId)
      .select("id");

    if (error) {
      statusEl.textContent = "Delete failed: " + error.message;
      return;
    }

    if (!data || data.length === 0) {
      statusEl.textContent = "Not deleted in Supabase.";
      return;
    }

    const rowEl = btnEl.closest("tr");
    if (rowEl) rowEl.remove();

    statusEl.textContent = "Movie deleted ✔";
    setTimeout(() => (statusEl.textContent = ""), 1200);
  } finally {
    btnEl.disabled = false;
  }
}

async function addMovie() {
  const statusEl = document.getElementById("crud-message");

  let titleInput, descriptionInput, imageUrlInput, typeInput;

  if (editingMovie) {
    titleInput = document.getElementById("edit-title");
    descriptionInput = document.getElementById("edit-description");
    imageUrlInput = document.getElementById("edit-image-url");
    typeInput = document.querySelector('input[name="edit-type"]:checked');
  } else {
    titleInput = document.getElementById("create-title");
    descriptionInput = document.getElementById("description");
    imageUrlInput = document.getElementById("create-image-url");
    typeInput = document.querySelector('input[name="create-type"]:checked');
  }

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const image_url = imageUrlInput.value.trim();
  const type = typeInput ? typeInput.value : "";

  if (!title || !description || !type) {
    statusEl.textContent = "Please enter title, description, and type.";
    return;
  }

  statusEl.textContent = "Saving...";

  let result;

  if (editingMovie) {
    result = await supabaseClient
      .from("movie")
      .update({
        title,
        description,
        image_url,
        type_id: parseInt(type),
      })
      .eq("id", editingMovie);
  } else {
    const { data: existingIds } = await supabaseClient
      .from("movie")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    const nextId =
      existingIds && existingIds.length > 0 ? existingIds[0].id + 1 : 1;

    result = await supabaseClient.from("movie").insert([
      {
        id: nextId,
        title,
        description,
        image_url,
        type_id: parseInt(type),
      },
    ]);
  }

  if (result.error) {
    statusEl.textContent = "Save failed: " + result.error.message;
    return;
  }

  editingMovie = null;

  titleInput.value = "";
  descriptionInput.value = "";
  imageUrlInput.value = "";
  if (typeInput) typeInput.checked = false;

  document.getElementById("update-movie-form").classList.add("hidden");
  document.getElementById("create-movie-form").classList.remove("hidden");

  statusEl.textContent = "Saved ✔";
  setTimeout(() => (statusEl.textContent = ""), 1200);

  await loadMovies();
}

function editMovie(movieId, title, description, image_url, type_id) {
  editingMovie = movieId;

  document.getElementById("edit-title").value = title;
  document.getElementById("edit-description").value = description;
  document.getElementById("edit-image-url").value = image_url;

  if (type_id == 1) {
    document.getElementById("edit-movie").checked = true;
  } else {
    document.getElementById("edit-tvshow").checked = true;
  }

  document.getElementById("update-movie-form").classList.remove("hidden");
  document.getElementById("create-movie-form").classList.add("hidden");

  document.getElementById("crud-message").textContent = "Editing movie...";
}

function toggleMenu() {
  const navbar = document.querySelector(".navbar");
  const header = document.querySelector(".header");

  navbar.classList.toggle("active");
  header.classList.toggle("menu-open");
}
