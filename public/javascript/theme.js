export function initTheme() {
  const htmlEl = document.documentElement;
  const switches = Array.from(document.querySelectorAll('.theme-switch'));
  if (!switches.length) return;

  // Apply & persist a theme
  const apply = theme => {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // sync all toggles
    switches.forEach(sw => sw.checked = (theme === 'dark'));
  };

  // on load: pick stored or OS‐pref
  const stored = localStorage.getItem('theme');
  if (stored) {
    apply(stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    apply('dark');
  } else {
    apply('light');
  }

  // on any toggle flip, apply & sync
  switches.forEach(sw => {
    sw.addEventListener('change', () => {
      apply(sw.checked ? 'dark' : 'light');
    });
  });
}
