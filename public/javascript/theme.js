export function initTheme(cmEditor) {
  const htmlEl      = document.documentElement;
  const themeSwitch = document.getElementById("themeSwitch");

  const setTheme = (theme) => {
    htmlEl.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
    themeSwitch.checked = theme === "dark";

    if (cmEditor) {
      const cmTheme = theme === "dark" ? "dracula" : "eclipse";
      cmEditor.setOption("theme", cmTheme);
    }
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
