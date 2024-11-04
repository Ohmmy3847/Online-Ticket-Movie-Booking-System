
const loginLink = document.getElementById("login-link");
const currentUrl = window.location.pathname + window.location.search; // Get current URL (path and query string)

// Set href with redirect parameter
loginLink.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
