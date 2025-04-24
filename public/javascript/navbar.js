export function initNavbar() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navItems  = document.querySelector('.nav-items');

  if (toggleBtn && navItems) {
    toggleBtn.addEventListener('click', () => {
      const open = toggleBtn.classList.toggle('open');
      navItems.classList.toggle('open', open);
    });

    // close burger when clicking any link/button except the settings-btn
    navItems.querySelectorAll('a, button').forEach(el => {
      if (el.getAttribute('aria-label') !== 'Settings') {
        el.addEventListener('click', () => {
          if (toggleBtn.classList.contains('open')) {
            toggleBtn.classList.remove('open');
            navItems.classList.remove('open');
          }
        });
      }
    });
  }

  // — Desktop settings dropdown —
  const settingsDropdown = document.querySelector('.settings-dropdown');
  const settingsBtn      = settingsDropdown?.querySelector('.settings-btn');
  const settingsMenu     = settingsDropdown?.querySelector('.settings-menu');

  if (settingsBtn && settingsDropdown && settingsMenu) {
    // toggle open/close
    settingsBtn.addEventListener('click', e => {
      e.stopPropagation();
      settingsDropdown.classList.toggle('open');
    });

    // prevent clicks inside the menu from closing it
    settingsMenu.addEventListener('click', e => {
      e.stopPropagation();
    });

    // close when clicking anywhere else
    document.addEventListener('click', () => {
      settingsDropdown.classList.remove('open');
    });
  }
}
