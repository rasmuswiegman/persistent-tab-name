const $ = (id) => document.getElementById(id);

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  let url;
  try { url = new URL(tab.url); } catch { $("msg").textContent = "Can't rename this tab."; return; }
  const ku = "url:" + tab.url.split("#")[0];
  const ks = "site:" + url.hostname;
  $("host").textContent = url.hostname;

  chrome.storage.sync.get([ku, ks], (r) => {
    if (r[ku]) { $("title").value = r[ku]; }
    else if (r[ks]) { $("title").value = r[ks]; document.querySelector('[value=site]').checked = true; }
    else { $("title").value = tab.title || ""; }
    $("title").select();
  });

  const setNow = (t) => chrome.scripting.executeScript({
    target: { tabId: tab.id }, func: (x) => { document.title = x; }, args: [t]
  }).catch(() => {});

  function save() {
    const t = $("title").value.trim();
    if (!t) return;
    const scope = document.querySelector("input[name=scope]:checked").value;
    const key = scope === "url" ? ku : ks;
    chrome.storage.sync.set({ [key]: t }, () => { setNow(t); window.close(); });
  }

  $("save").onclick = save;
  $("title").addEventListener("keydown", (e) => { if (e.key === "Enter") save(); });
  $("reset").onclick = () => chrome.storage.sync.remove([ku, ks], () => {
    $("msg").textContent = "Removed. Reload the page to get the original title.";
  });
});
