// 5 minute offers - the only script. copy buttons on prompt blocks,
// active nav highlighting. nothing decorative, nothing continuous.

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copy");
  if (!btn) return;
  const pre = btn.closest(".prompt")?.querySelector("pre");
  if (!pre) return;
  try {
    await navigator.clipboard.writeText(pre.textContent.trim());
    btn.textContent = "copied";
    btn.classList.add("done");
    setTimeout(() => {
      btn.textContent = "copy";
      btn.classList.remove("done");
    }, 1600);
  } catch {
    // clipboard blocked (file:// or permissions) - select the text instead
    const r = document.createRange();
    r.selectNodeContents(pre);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }
});

// mark the current page in the nav
const here = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((a) => {
  const target = a.getAttribute("href").split("/").pop();
  if (target === here) a.classList.add("active");
});
