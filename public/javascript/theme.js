export function initTheme() {
  const htmlEl    = document.documentElement;
  const switches  = Array.from(document.querySelectorAll('.theme-switch'));
  const logoImage = document.getElementById('appLogo'); 

  const logoLightPath = '/resources/logo-light.svg';
  const logoDarkPath  = '/resources/logo-dark.svg';


  if (!switches.length && !logoImage) return;

  const apply = theme => {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    switches.forEach(sw => sw.checked = (theme === 'dark'));

    if (logoImage) {
      logoImage.src = theme === 'dark' ? logoDarkPath : logoLightPath;
    }
  };

  const stored = localStorage.getItem('theme');
  let initialTheme = 'light';

  if (stored) {
    initialTheme = stored;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    initialTheme = 'dark';
  }

  apply(initialTheme);

  switches.forEach(sw => {
    sw.addEventListener('change', () => {
      apply(sw.checked ? 'dark' : 'light');
    });
  });
}
