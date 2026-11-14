// Apply the saved theme before the first paint (external file: CSP forbids inline scripts).
(function () {
  var t = 'cinema';
  try {
    if (localStorage.getItem('saiyakat.theme') === 'silver') t = 'silver';
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', t);
})();
