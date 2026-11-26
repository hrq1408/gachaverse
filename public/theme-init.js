(() => {
  try {
    if (localStorage.getItem('gachaverse-theme') === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    }
  } catch {}
})();
