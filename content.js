// Applies a stored custom title. Exact-URL rules win over whole-site rules.
(() => {
  let wanted = null;
  let observer = null;

  const keyUrl = () => "url:" + location.href.split("#")[0];
  const keySite = () => "site:" + location.hostname;

  function apply() {
    if (wanted && document.title !== wanted) document.title = wanted;
  }

  function watch() {
    if (observer) return;
    observer = new MutationObserver(apply);
    const start = () => {
      observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
      apply();
    };
    document.documentElement ? start() : document.addEventListener("DOMContentLoaded", start);
  }

  function load() {
    const ku = keyUrl(), ks = keySite();
    chrome.storage.sync.get([ku, ks], (r) => {
      wanted = r[ku] || r[ks] || null;
      if (wanted) { watch(); apply(); }
      else if (observer) { observer.disconnect(); observer = null; }
    });
  }

  load();
  chrome.storage.onChanged.addListener(load);
  // Single-page apps change URL without reloading
  let last = location.href;
  setInterval(() => { if (location.href !== last) { last = location.href; load(); } }, 1000);
})();
