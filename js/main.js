/* Play11 Main JS */
const onReady = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

const setupNav = () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("open")) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".nav-links") || target.closest(".nav-toggle")) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
};

const setupReveal = () => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item) => observer.observe(item));
};

const setupFilters = () => {
  const cards = Array.from(document.querySelectorAll(".jersey-card"));
  if (!cards.length) return;

  const sizeFilter = document.querySelector("#filter-size");
  const teamFilter = document.querySelector("#filter-team");
  const searchInput = document.querySelector("#search-input");
  const noResults = document.querySelector("#no-results");

  const applyFilters = () => {
    const size = (sizeFilter?.value || "all").toLowerCase();
    const team = (teamFilter?.value || "all").toLowerCase();
    const query = (searchInput?.value || "").trim().toLowerCase();

    let visibleCount = 0;

    cards.forEach((card) => {
      const sizes = (card.dataset.sizes || "").split(",").map((s) => s.trim());
      const cardTeam = (card.dataset.team || "").toLowerCase();
      const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const desc = (card.querySelector("p")?.textContent || "").toLowerCase();

      const matchesSize = size === "all" || sizes.includes(size);
      const matchesTeam = team === "all" || cardTeam === team;
      const matchesSearch = !query || name.includes(query) || desc.includes(query);

      const shouldShow = matchesSize && matchesTeam && matchesSearch;
      card.style.display = shouldShow ? "" : "none";
      if (shouldShow) visibleCount += 1;
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? "block" : "none";
    }
  };

  [sizeFilter, teamFilter, searchInput].forEach((control) => {
    if (!control) return;
    control.addEventListener("change", applyFilters);
    control.addEventListener("input", applyFilters);
  });

  applyFilters();
};

const setupContactForm = () => {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const errorBox = form.querySelector(".form-error");
  const successBox = form.querySelector(".form-success");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");

    const errors = [];
    if (!name.value.trim()) errors.push("Name is required.");
    if (!email.value.trim()) {
      errors.push("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      errors.push("Enter a valid email address.");
    }
    if (!message.value.trim() || message.value.trim().length < 10) {
      errors.push("Message should be at least 10 characters.");
    }

    if (errors.length) {
      if (successBox) successBox.style.display = "none";
      if (errorBox) {
        errorBox.textContent = errors.join(" ");
        errorBox.style.display = "block";
      }
      return;
    }

    if (errorBox) errorBox.style.display = "none";
    if (successBox) successBox.style.display = "block";
    form.reset();
  });
};

const setupHeroBackground = () => {
  const embed = document.querySelector("[data-hero-embed]");
  const video = document.querySelector("[data-hero-video]");
  if (!embed || !video) return;

  document.body.classList.add("use-youtube-video");
  document.body.classList.remove("use-local-video");
};

const setupHeroVideo = () => {
  const heroVideo = document.querySelector("[data-hero-video]");
  if (!heroVideo) return;
  if (document.body.classList.contains("use-youtube-video")) return;

  const startCanvasFallback = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    if (!ctx || !canvas.captureStream) {
      document.body.classList.add("video-fallback");
      return;
    }

    let t = 0;
    const draw = () => {
      t += 0.005;
      const shift = (Math.sin(t) + 1) / 2;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, `hsl(${210 + shift * 20}, 60%, 18%)`);
      gradient.addColorStop(0.55, `hsl(${10 + shift * 18}, 70%, 26%)`);
      gradient.addColorStop(1, `hsl(${230 - shift * 10}, 70%, 16%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      for (let i = -height; i < width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(draw);
    };

    draw();

    const stream = canvas.captureStream(30);
    heroVideo.srcObject = stream;
    heroVideo.muted = true;
    heroVideo.playsInline = true;
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        document.body.classList.add("video-fallback");
      });
    }
  };

  const hasSource = heroVideo.querySelector("source")?.getAttribute("src");
  if (hasSource) {
    heroVideo.addEventListener("error", startCanvasFallback, { once: true });
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(startCanvasFallback);
    }
    return;
  }

  startCanvasFallback();
};

onReady(() => {
  document.body.classList.add("loaded");
  setupNav();
  setupReveal();
  setupFilters();
  setupContactForm();
  setupHeroBackground();
  setupHeroVideo();
});
