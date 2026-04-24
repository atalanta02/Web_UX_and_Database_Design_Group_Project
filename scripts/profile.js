const SUPABASE_URL = "https://jtqkbhgucspgklccgawd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cWtiaGd1Y3NwZ2tsY2NnYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjE4NTIsImV4cCI6MjA3NTU5Nzg1Mn0.fBiGoem1tfS2RInqdBv9EekdIdw5ydQIPUl_JewMJ_M";

// message system (UPDATED)
function showMessage(msg, type = "info", persist = false) {
  const alerts = document.getElementById("alerts");
  alerts.innerHTML = `<div class="${type}">${msg}</div>`;

  if (!persist) {
    setTimeout(() => {
      alerts.innerHTML = "";
    }, 3000);
  }
}

function clearMessage() {
  document.getElementById("alerts").innerHTML = "";
}

function toggleMenu() {
  document.querySelector(".navbar").classList.toggle("active");
  document.querySelector(".header").classList.toggle("menu-open");
}

document.addEventListener("DOMContentLoaded", async () => {

  if (!window.supabase) return;

  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");

  const loginSection = document.getElementById("loginSection");
  const signupSection = document.getElementById("signupSection");
  const profileSection = document.getElementById("profileSection");

  const userEmail = document.getElementById("userEmail");

  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");

  signupForm.reset();
  loginForm.reset();

  function showLogin() {
    loginSection.style.display = "block";
    signupSection.style.display = "none";
    profileSection.style.display = "none";

    loginBtn.classList.add("active");
    signupBtn.classList.remove("active");

    clearMessage();
  }

  function showSignup() {
    loginSection.style.display = "none";
    signupSection.style.display = "block";
    profileSection.style.display = "none";

    signupBtn.classList.add("active");
    loginBtn.classList.remove("active");

    clearMessage();
  }

  function renderUser(user) {
    if (user) {
      profileSection.style.display = "block";
      loginSection.style.display = "none";
      signupSection.style.display = "none";

      userEmail.textContent = user.email;

      showMessage("Welcome back!", "success");
    } else {
      showLogin();
    }
  }

  loginBtn.addEventListener("click", showLogin);
  signupBtn.addEventListener("click", showSignup);

  supabase.auth.onAuthStateChange((event, session) => {
    renderUser(session?.user || null);
  });

  showMessage("Checking session...", "info", true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  renderUser(user);

  let isSigningUp = false;
  let isLoggingIn = false;

  // signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isSigningUp) return;
  isSigningUp = true;

  showMessage("Creating account...", "info", true);

  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");

  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });

  isSigningUp = false;

  if (error) return showMessage(error.message, "error");

  signupForm.reset();

  requestAnimationFrame(() => {
    emailInput.value = "";
    passwordInput.value = "";
  });

  showMessage(
    "Account created successfully! Check your email to confirm.",
    "success"
  );

  showLogin();
});

  // login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isLoggingIn) return;
    isLoggingIn = true;

    showMessage("Logging in...", "info", true);

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.value,
      password: passwordInput.value,
    });

    isLoggingIn = false;

    if (error) return showMessage("Wrong email or password", "error");

    loginForm.reset();

    requestAnimationFrame(() => {
      emailInput.value = "";
      passwordInput.value = "";
    });

    showMessage("Logged in successfully!", "success");
  });

  // logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    showMessage("Logging out...", "info", true);

    await supabase.auth.signOut();

    showMessage("Logged out successfully", "success");
  });
});