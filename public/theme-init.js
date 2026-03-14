// Apply saved theme before React loads to prevent flash of wrong theme.
// This file MUST be loaded synchronously in <head> (no defer/async).
try {
  var t = localStorage.getItem("kq_theme");
  if (t) document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
