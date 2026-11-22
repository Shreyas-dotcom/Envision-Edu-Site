// Envision Education — small, dependency-free interactions.
document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile menu ---------- */
const navToggle = document.querySelector(".nav-toggle");
navToggle?.addEventListener("click", () => {
  const open = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
// close the menu after picking a link (matters for links to a section of the same page)
document.querySelectorAll(".site-nav a").forEach((a) => a.addEventListener("click", () => {
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
}));
document.querySelectorAll(".sub-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sub = btn.nextElementSibling;
    const open = sub.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });
});

/* ---------- Photo slideshows ---------- */
document.querySelectorAll("[data-slideshow]").forEach((show) => {
  const slides = [...show.querySelectorAll(".slideshow__slide")];
  const counter = show.querySelector("[data-current]");
  let i = 0, timer;
  const go = (n) => {
    slides[i].classList.remove("is-active");
    i = (n + slides.length) % slides.length;
    slides[i].classList.add("is-active");
    // warm up the next photo
    const next = slides[(i + 1) % slides.length].querySelector("img");
    if (next) next.loading = "eager";
    if (counter) counter.textContent = i + 1;
  };
  const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(i + 1), 4500); };
  show.querySelector(".slideshow__btn--prev").addEventListener("click", () => { go(i - 1); restart(); });
  show.querySelector(".slideshow__btn--next").addEventListener("click", () => { go(i + 1); restart(); });
  show.addEventListener("mouseenter", () => clearInterval(timer));
  show.addEventListener("mouseleave", restart);
  let x0 = null;
  show.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  show.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); restart(); }
    x0 = null;
  });
  restart();
});

/* ---------- Testimonials ---------- */
document.querySelectorAll("[data-quotes]").forEach((wrap) => {
  const items = [...wrap.querySelectorAll(".quote")];
  const dots = [...wrap.querySelectorAll(".quotes__dots button")];
  let i = 0, timer;
  const go = (n) => {
    items[i].classList.remove("is-active"); dots[i].removeAttribute("aria-current");
    i = (n + items.length) % items.length;
    items[i].classList.add("is-active"); dots[i].setAttribute("aria-current", "true");
  };
  const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(i + 1), 6500); };
  wrap.querySelector(".quotes__btn--prev").addEventListener("click", () => { go(i - 1); restart(); });
  wrap.querySelector(".quotes__btn--next").addEventListener("click", () => { go(i + 1); restart(); });
  dots.forEach((d, n) => d.addEventListener("click", () => { go(n); restart(); }));
  restart();
});

/* ---------- YouTube: load the player only when clicked ---------- */
function playYouTube(container, id) {
  container.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
}
document.querySelectorAll("[data-yt]").forEach((el) => {
  el.querySelector(".yt__poster")?.addEventListener("click", () => playYouTube(el, el.dataset.yt));
});

/* TelEnvision: pick a video from the list */
document.querySelectorAll("[data-tel]").forEach((tel) => {
  const stage = tel.querySelector(".yt");
  tel.querySelectorAll("[data-video]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tel.querySelectorAll("[data-video]").forEach((b) => b.removeAttribute("aria-current"));
      btn.setAttribute("aria-current", "true");
      stage.dataset.yt = btn.dataset.video;
      playYouTube(stage, btn.dataset.video);
      stage.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  });
});

/* ---------- Scroll effects ---------- */
const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    if (e.target.matches("[data-count]")) countUp(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.25 }) : null;

function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.textContent.replace(/[0-9]/g, "");
  if (reduceMotion) return;
  const start = performance.now(), dur = 1400;
  const tick = (t) => {
    const p = Math.min(1, (t - start) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
document.querySelectorAll(".reveal, [data-count], .project").forEach((el) => io ? io.observe(el) : el.classList.add("is-in"));

/* ---------- Contact form ----------
   If site.json has a "contactFormEndpoint" (e.g. a Formspree URL) the message is
   posted there. Otherwise it opens the visitor's email app with everything filled in. */
document.querySelectorAll("[data-contact]").forEach((form) => {
  const status = form.querySelector(".contact__status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (form.getAttribute("action")) {
      status.textContent = "Sending…";
      try {
        const res = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error();
        form.reset();
        status.textContent = "Thanks for submitting!";
      } catch {
        status.textContent = "Something went wrong. Please email us at " + form.dataset.email;
      }
      return;
    }
    const subject = data.get("subject") || "Inquiry";
    const body = `${data.get("message") || ""}\n\n— ${data.get("name") || ""} (${data.get("email")})`;
    window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Opening your email app…";
  });
});

/* ---------- Lightbox ----------
   Gallery groups ([data-lightbox], links to the full-size photo) and blog photos.
   Arrows move within the same group. */
const lightboxGroups = [...document.querySelectorAll("[data-lightbox]")].map((g) =>
  [...g.querySelectorAll("a")].map((a) => ({ el: a, src: a.href })));
const blogImgs = [...document.querySelectorAll(".post-gallery img, .prose > p > img")];
if (blogImgs.length) lightboxGroups.push(blogImgs.map((img) => ({ el: img, src: img.currentSrc || img.src })));

let lb = null, lbItems = [], lbIdx = 0, lbOpener = null;
function lbShow(n) {
  lbIdx = (n + lbItems.length) % lbItems.length;
  lb.querySelector("img").src = lbItems[lbIdx].src;
  lb.querySelector(".lb-count").textContent = `${lbIdx + 1} / ${lbItems.length}`;
  const next = lbItems[(lbIdx + 1) % lbItems.length];
  if (next) new Image().src = next.src;
}
function lbClose() {
  lb?.remove(); lb = null;
  document.removeEventListener("keydown", lbKey);
  document.body.style.overflow = "";
  lbOpener?.focus();
}
function lbKey(e) {
  if (e.key === "Escape") lbClose();
  if (e.key === "ArrowRight") lbShow(lbIdx + 1);
  if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
}
function lbOpen(items, n, opener) {
  lbItems = items; lbOpener = opener;
  lb = document.createElement("div");
  lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
  lb.innerHTML = `<img alt=""><button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous photo">&#8249;</button><button class="lb-next" aria-label="Next photo">&#8250;</button><p class="lb-count" aria-live="polite"></p>`;
  lb.addEventListener("click", (e) => { if (e.target === lb) lbClose(); });
  lb.querySelector(".lb-close").onclick = lbClose;
  lb.querySelector(".lb-prev").onclick = () => lbShow(lbIdx - 1);
  lb.querySelector(".lb-next").onclick = () => lbShow(lbIdx + 1);
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) lbShow(dx < 0 ? lbIdx + 1 : lbIdx - 1);
    x0 = null;
  });
  document.body.append(lb); document.body.style.overflow = "hidden";
  document.addEventListener("keydown", lbKey);
  lbShow(n); lb.querySelector(".lb-close").focus();
}
lightboxGroups.forEach((items) => items.forEach((item, n) => {
  item.el.addEventListener("click", (e) => { e.preventDefault(); lbOpen(items, n, item.el); });
}));

/* ---------- Links to a section (#team, #film…): land on it once photos and fonts have loaded ---------- */
window.addEventListener("load", () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
});
