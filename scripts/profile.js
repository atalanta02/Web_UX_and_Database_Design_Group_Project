const SUPABASE_URL = "https://jtqkbhgucspgklccgawd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cWtiaGd1Y3NwZ2tsY2NnYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjE4NTIsImV4cCI6MjA3NTU5Nzg1Mn0.fBiGoem1tfS2RInqdBv9EekdIdw5ydQIPUl_JewMJ_M";

function showMessage(msg, type) {
  document.getElementById("alerts").innerHTML = `<div class="${type}">${msg}</div>`;
}

function toggleMenu() {
  const navbar = document.querySelector(".navbar");
  const header = document.querySelector(".header");

  navbar.classList.toggle("active");
  header.classList.toggle("menu-open");
}
function renderUser(user) {
  if (user) {
    profileSection.style.display = "block";
    loginSection.style.display = "none";
    signupSection.style.display = "none";

    userEmail.textContent = user.email;
  } else {
    profileSection.style.display = "none";
    showLogin();
 }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("SCRIPT LOADED");

  if (!window.supabase) {
    console.error("Supabase not loaded");
    return;
  }

  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );

  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");

  const loginSection = document.getElementById("loginSection");
  const signupSection = document.getElementById("signupSection");
  const profileSection = document.getElementById("profileSection");

  const userEmail = document.getElementById("userEmail");

  if (!loginBtn || !signupBtn || !loginSection || !signupSection) {
    console.error("Missing HTML elements");
    return;
  }

  function showLogin() {
    loginSection.style.display = "block";
    signupSection.style.display = "none";

    loginBtn.classList.add("active");
    signupBtn.classList.remove("active");
  }

  function showSignup() {
    loginSection.style.display = "none";
    signupSection.style.display = "block";

    signupBtn.classList.add("active");
    loginBtn.classList.remove("active");
  }

  loginBtn.addEventListener("click", showLogin);
  signupBtn.addEventListener("click", showSignup);

  showLogin();

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    try {
      if (data.user) {
        renderUser(data.user);
      } else {
        showLogin();
      }
    } catch (error) {
      console.error(error.message);
      return showMessage(error.message, "error");
    }
  }

  checkUser();

  let isSigningUp = false;
  let isLoggingIn = false;

  document
    .getElementById("signupForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      console.log("SIGNUP CLICK");

      if (isSigningUp) return;
      isSigningUp = true;

      const btn = e.target.querySelector("button");
      btn.disabled = true;

      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      btn.disabled = false;
      isSigningUp = false;

      if (error) {
        console.error(error.message);
        return showMessage(error.message, "error");
      }

      showMessage("Signup successful! Now log in.", "success");
      showLogin();
    });

  document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      console.log("LOGIN CLICK");

      if (isLoggingIn) return;
      isLoggingIn = true;

      const btn = e.target.querySelector("button");
      btn.disabled = true;

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      btn.disabled = false;
      isLoggingIn = false;

      if (error) {
        console.error(error.message);
        return showMessage(error.message, "error");
      }

      checkUser();
    });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    checkUser();
  });
});
