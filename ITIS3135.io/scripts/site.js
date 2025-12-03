// site.js — small helpers for the site
// Currently used to mark the active navigation link based on the current path
document.addEventListener('DOMContentLoaded', function () {
  try {
    const navLinks = document.querySelectorAll('header nav a');
    const path = window.location.pathname.toLowerCase();
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.toLowerCase().includes(path.split('/').pop())) {
        a.classList.add('active');
      }
    });
  } catch (e) {
    // no-op
  }
});
