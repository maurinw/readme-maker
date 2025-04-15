export function initTheme() {
  const htmlEl      = document.documentElement;
  const themeSwitch = document.getElementById("themeSwitch");

  const setTheme = (theme) => {
    htmlEl.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    themeSwitch.checked = theme === "dark";
  };

  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    setTheme(storedTheme);
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setTheme("dark");
  } else {
    setTheme("light");
  }

  themeSwitch.addEventListener("change", () => {
    const newTheme = themeSwitch.checked ? "dark" : "light";
    setTheme(newTheme);
  });
}
