// Envision Education — small, dependency-free interactions.
document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile menu ---------- */
const navToggle = document.querySelector(".nav-toggle");
navToggle?.addEventListener("click", () => {
  const open = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
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

/* ---------- Before / after photos: tap to toggle on touch screens ---------- */
document.querySelectorAll(".before-after").forEach((fig) => {
  fig.addEventListener("click", () => fig.classList.toggle("is-after"));
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

/* ---------- Blog gallery lightbox ---------- */
const galleryImgs = [...document.querySelectorAll(".post-gallery img, .prose > p > img")];
if (galleryImgs.length) {
  let lb, idx = 0;
  const show = (n) => { idx = (n + galleryImgs.length) % galleryImgs.length; lb.querySelector("img").src = galleryImgs[idx].currentSrc || galleryImgs[idx].src; };
  const close = () => { lb?.remove(); lb = null; document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") show(idx + 1); if (e.key === "ArrowLeft") show(idx - 1); };
  galleryImgs.forEach((img, n) => img.addEventListener("click", () => {
    lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML = `<img alt=""><button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous">&#8249;</button><button class="lb-next" aria-label="Next">&#8250;</button>`;
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    lb.querySelector(".lb-close").onclick = close;
    lb.querySelector(".lb-prev").onclick = () => show(idx - 1);
    lb.querySelector(".lb-next").onclick = () => show(idx + 1);
    document.body.append(lb); document.addEventListener("keydown", onKey);
    show(n); lb.querySelector(".lb-close").focus();
  }));
}
