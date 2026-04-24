// 1) Connect to Supabase
const SUPABASE_URL = "https://jtqkbhgucspgklccgawd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cWtiaGd1Y3NwZ2tsY2NnYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjE4NTIsImV4cCI6MjA3NTU5Nzg1Mn0.fBiGoem1tfS2RInqdBv9EekdIdw5ydQIPUl_JewMJ_M";

let supabaseClient;
let editingMovie = null;
let crudListenersBound = false;
let moviesTableName = "movie";

async function resolveMoviesTableName() {
  const candidates = ["movie", "Movie"];
  for (const name of candidates) {
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

function bindCrudListeners() {
  if (crudListenersBound) return;
  crudListenersBound = true;

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
}

function setManageFormsEnabled(canManage) {
  const hint = document.getElementById("manage-auth-hint");
  if (hint) {
    if (canManage) {
      hint.textContent = "";
      hint.hidden = true;
    } else {
      hint.textContent =
        "Sign in on Profile to add, edit, or delete entries. Everyone can view this list.";
      hint.hidden = false;
    }
  }

  ["create-movie-form", "update-movie-form"].forEach((formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll("input, textarea, button").forEach((el) => {
      el.disabled = !canManage;
    });
  });
}

async function initManagePage() {
  moviesTableName = await resolveMoviesTableName();
  bindCrudListeners();
  await loadMovies();
}

window.addEventListener("DOMContentLoaded", async () => {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );

  await initManagePage();

  supabaseClient.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_OUT") {
      editingMovie = null;
      document.getElementById("update-movie-form").classList.add("hidden");
      document.getElementById("create-movie-form").classList.remove("hidden");
      document.getElementById("crud-message").textContent =
        "Signed out. You can still browse the catalog below.";
      setTimeout(() => {
        document.getElementById("crud-message").textContent = "";
      }, 4000);
      await loadMovies();
      return;
    }
    if (event === "SIGNED_IN") {
      await loadMovies();
    }
  });
});

async function loadMovies() {
  const tableBody = document.getElementById("movie-table-body");
  const statusEl = document.getElementById("crud-message");

  tableBody.innerHTML = '<tr><td colspan="6">Loading data…</td></tr>';

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  const canManage = !!user;

  const { data, error } = await supabaseClient
    .from(moviesTableName)
    .select("id, title, description, image_url, type_id")
    .order("id", { ascending: true });

  if (error) {
    tableBody.innerHTML = '<tr><td colspan="6">Error loading data</td></tr>';
    statusEl.textContent = error.message;
    console.error("loadMovies:", error);
    setManageFormsEnabled(false);
    return;
  }

  if (!data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No movies found</td></tr>';
    statusEl.textContent = "Tip: add titles in Supabase or sign in to use the form above.";
    setManageFormsEnabled(canManage);
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

    if (canManage) {
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
    } else {
      actionsTd.textContent = "—";
    }

    row.appendChild(actionsTd);
    tableBody.appendChild(row);
  });

  statusEl.textContent = "";
  setManageFormsEnabled(canManage);
}

async function assertCanMutate(statusEl) {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();
  if (error || !user) {
    statusEl.textContent =
      "Sign in on Profile to add, edit, or delete entries.";
    return false;
  }
  return true;
}

async function deleteMovie(movieId, btnEl) {
  const statusEl = document.getElementById("crud-message");

  if (!(await assertCanMutate(statusEl))) return;

  if (!confirm(`Delete movie ID ${movieId}?`)) return;

  btnEl.disabled = true;
  statusEl.textContent = "Deleting...";

  try {
    const { data: refreshed, error: refreshErr } =
      await supabaseClient.auth.refreshSession();
    if (refreshErr || !refreshed.session) {
      statusEl.textContent =
        "Session expired. Sign in again on Profile.";
      return;
    }

    const { error, count } = await supabaseClient
      .from(moviesTableName)
      .delete({ count: "exact" })
      .eq("id", movieId);

    if (error) {
      statusEl.textContent = "Delete failed: " + error.message;
      return;
    }

    if (count === null || count === 0) {
      statusEl.textContent =
        "Nenhuma linha foi eliminada. Com sessão iniciada, o Supabase usa o papel authenticated: em SQL Editor execute Database/rls_movie_authenticated.sql (ou políticas equivalentes para UPDATE/DELETE em movie).";
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

  if (!(await assertCanMutate(statusEl))) return;

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

  const { data: refreshed, error: refreshErr } =
    await supabaseClient.auth.refreshSession();
  if (refreshErr || !refreshed.session) {
    statusEl.textContent =
      "Session expired. Sign in again on Profile.";
    return;
  }

  const wasEditing = !!editingMovie;
  let result;

  if (editingMovie) {
    result = await supabaseClient
      .from(moviesTableName)
      .update({
        title,
        description,
        image_url,
        type_id: parseInt(type),
      })
      .eq("id", editingMovie)
      .select("id");
  } else {
    // SERIAL id: omit so the database generates the next value
    result = await supabaseClient
      .from(moviesTableName)
      .insert([
        {
          title,
          description,
          image_url,
          type_id: parseInt(type),
        },
      ])
      .select("id");
  }

  if (result.error) {
    statusEl.textContent = "Save failed: " + result.error.message;
    return;
  }

  if (wasEditing && (!result.data || result.data.length === 0)) {
    statusEl.textContent =
      "Nenhuma linha foi atualizada. Confira RLS no Supabase para UPDATE na tabela movie para o papel authenticated (ficheiro Database/rls_movie_authenticated.sql).";
    return;
  }

  if (!wasEditing && (!result.data || result.data.length === 0)) {
    statusEl.textContent =
      "O registo não foi criado. Confira RLS para INSERT na tabela movie (papel authenticated).";
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
