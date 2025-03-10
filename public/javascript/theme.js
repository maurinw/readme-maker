document.addEventListener('DOMContentLoaded', function () {
  const htmlEl = document.documentElement;
  const themeSwitch = document.getElementById('themeSwitch');

  function setTheme(theme) {
    htmlEl.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    themeSwitch.checked = (theme === 'dark');
  }

  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    setTheme(storedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  } else {
    setTheme('light');
  }

  themeSwitch.addEventListener('change', function () {
    const newTheme = themeSwitch.checked ? 'dark' : 'light';
    setTheme(newTheme);
  });
});
