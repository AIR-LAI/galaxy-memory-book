(function () {
  const data = window.MEMORY_BOOK || { cover: {}, pages: [] };
  const pages = Array.isArray(data.pages) && data.pages.length ? data.pages : [];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let currentPage = 0;

  const body = document.body;
  const coverScreen = document.getElementById("coverScreen");
  const bookScreen = document.getElementById("bookScreen");
  const bookPage = document.getElementById("bookPage");
  const coverTitle = document.getElementById("coverTitle");
  const coverSubtitle = document.getElementById("coverSubtitle");
  const openBook = document.getElementById("openBook");
  const pageKicker = document.getElementById("pageKicker");
  const pageTitle = document.getElementById("pageTitle");
  const pageText = document.getElementById("pageText");
  const photoGrid = document.getElementById("photoGrid");
  const pageCounter = document.getElementById("pageCounter");
  const progressDots = document.getElementById("progressDots");
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");

  function setText(element, value) {
    if (element) {
      element.textContent = value || "";
    }
  }

  function handleImageError(event) {
    const image = event.currentTarget;
    const card = image.closest(".photo-card");
    if (!card) {
      return;
    }

    const source = image.getAttribute("src") || "photos/";
    image.remove();
    card.innerHTML = "";
    card.appendChild(createPlaceholder(source));
  }

  function createPlaceholder(source) {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-placeholder";

    const text = document.createElement("span");
    text.textContent = `把照片放到 ${source}，这里就会亮起来。`;
    placeholder.appendChild(text);

    return placeholder;
  }

  function normalizePhoto(photo) {
    if (typeof photo === "string") {
      return { src: photo, layout: "wide" };
    }

    return {
      src: photo?.src || "photos/",
      layout: photo?.layout || "wide"
    };
  }

  function createPhotoCard(photo, index) {
    const normalized = normalizePhoto(photo);
    const card = document.createElement("figure");
    card.className = `photo-card ${normalized.layout}`;
    card.style.animationDelay = `${index * 90}ms`;

    const image = document.createElement("img");
    image.src = normalized.src;
    image.alt = "我们的一张回忆照片";
    image.loading = "lazy";
    image.addEventListener("error", handleImageError, { once: true });

    card.appendChild(image);
    return card;
  }

  function renderProgress() {
    progressDots.innerHTML = "";

    pages.forEach((_, index) => {
      const dot = document.createElement("span");
      if (index === currentPage) {
        dot.className = "active";
      }
      progressDots.appendChild(dot);
    });
  }

  function renderPage() {
    if (!pages.length) {
      setText(pageTitle, "还没有写入回忆");
      setText(pageText, "先在 data/memories.js 里写下你们的故事。");
      return;
    }

    const page = pages[currentPage] || pages[0];
    const photos = Array.isArray(page.photos) && page.photos.length ? page.photos : [];
    const firstPhoto = normalizePhoto(photos[0]);

    setText(pageKicker, page.kicker);
    setText(pageTitle, page.title);
    setText(pageText, page.text);
    setText(pageCounter, `${currentPage + 1} / ${pages.length}`);

    bookPage.classList.toggle("finale", Boolean(page.finale));
    bookPage.classList.toggle("layout-portrait", firstPhoto.layout === "portrait");
    bookPage.classList.toggle("layout-wide", firstPhoto.layout !== "portrait");
    photoGrid.classList.toggle("single", photos.length <= 1);
    photoGrid.innerHTML = "";

    if (photos.length) {
      photos.slice(0, 2).forEach((source, index) => {
        photoGrid.appendChild(createPhotoCard(source, index));
      });
    } else {
      const card = document.createElement("figure");
      card.className = "photo-card";
      card.appendChild(createPlaceholder("photos/"));
      photoGrid.appendChild(card);
    }

    prevPage.disabled = currentPage === 0;
    nextPage.disabled = currentPage === pages.length - 1;
    renderProgress();
  }

  function animatePageTurn() {
    if (prefersReducedMotion.matches) {
      return;
    }

    bookPage.classList.remove("turning");
    void bookPage.offsetWidth;
    bookPage.classList.add("turning");
  }

  function showPage(index) {
    const nextIndex = Math.max(0, Math.min(index, pages.length - 1));
    if (nextIndex === currentPage && pages.length) {
      return;
    }

    currentPage = nextIndex;
    renderPage();
    animatePageTurn();
  }

  function openMemoryBook(event) {
    body.classList.add("is-opening");
    if (event) {
      event.preventDefault();
    }

    body.classList.remove("memory-locked");
    bookScreen.classList.remove("is-hidden");

    const delay = prefersReducedMotion.matches ? 10 : 650;
    window.setTimeout(() => {
      coverScreen.hidden = true;
      bookScreen.focus?.();
      renderPage();
      bookScreen.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
    }, delay);
  }

  function bindEvents() {
    openBook.addEventListener("click", openMemoryBook);
    prevPage.addEventListener("click", () => showPage(currentPage - 1));
    nextPage.addEventListener("click", () => showPage(currentPage + 1));

    window.addEventListener("keydown", (event) => {
      if (bookScreen.classList.contains("is-hidden")) {
        return;
      }

      if (event.key === "ArrowRight") {
        showPage(currentPage + 1);
      }

      if (event.key === "ArrowLeft") {
        showPage(currentPage - 1);
      }
    });
  }

  function init() {
    setText(coverTitle, data.cover?.title || "给你的星河回忆册");
    setText(coverSubtitle, data.cover?.subtitle || "慢慢翻，里面都是我们。");
    setText(openBook.querySelector("span"), data.cover?.buttonText || "打开");
    bindEvents();
    renderPage();
  }

  init();
})();
