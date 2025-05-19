export function initTheme() {
  const htmlEl    = document.documentElement;
  const switches  = Array.from(document.querySelectorAll('.theme-switch'));
  const logoImage = document.getElementById('appLogo');

  const logoLightPath = '/resources/logo-light.svg';
  const logoDarkPath  = '/resources/logo-dark.svg';

  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    switches.forEach(sw => sw.checked = (theme === 'dark'));
    if (logoImage) {
      logoImage.src = theme === 'dark' ? logoDarkPath : logoLightPath;
    }
  };

  const preferredScheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const initialTheme = localStorage.getItem('theme') ?? preferredScheme;

  applyTheme(initialTheme);

  switches.forEach(sw => {
    sw.addEventListener('change', (e) => {
      applyTheme(e.target.checked ? 'dark' : 'light');
    });
  });
}
