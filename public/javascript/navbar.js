export function initNavbar() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const sidebar   = document.querySelector('.sidebar');
  const closeBtn  = sidebar?.querySelector('.sidebar-close');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.classList.toggle('open');
      sidebar.classList.toggle('open', isOpen);
    });
  }

  if (closeBtn && toggleBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      toggleBtn.classList.remove('open');
      sidebar.classList.remove('open');
    });
  }

  // Close sidebar when any link is clicked
  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('open');
      sidebar.classList.remove('open');
    });
  });

}
