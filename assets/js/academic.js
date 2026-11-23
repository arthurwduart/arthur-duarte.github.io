const filters = document.querySelector('[data-publication-filters]');

if (filters) {
  const search = filters.querySelector('[data-publication-search]');
  const year = filters.querySelector('[data-publication-year]');
  const count = filters.querySelector('[data-publication-count]');
  const empty = document.querySelector('[data-publication-empty]');
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const publications = Array.from(document.querySelectorAll('.publication'), (item) => ({
    item,
    text: normalize(Array.from(item.querySelectorAll('h2, h3, div > p:first-of-type'), (field) => field.textContent).join(' ')),
  }));

  function filterPublications() {
    const words = normalize(search.value).trim().split(/\s+/);
    let visible = 0;

    for (const publication of publications) {
      const matchesYear = !year.value || publication.item.dataset.year === year.value;
      const matchesSearch = words.every((word) => publication.text.includes(word));
      publication.item.hidden = !(matchesYear && matchesSearch);
      if (!publication.item.hidden) visible += 1;
    }

    count.textContent = visible === 1 ? '1 publicação' : `${visible} publicações`;
    empty.hidden = visible !== 0;
  }

  search.addEventListener('input', filterPublications);
  year.addEventListener('change', filterPublications);
  filterPublications();
  filters.hidden = false;
}

const gallery = document.querySelector('[data-map-gallery]');
const viewer = document.querySelector('[data-map-viewer]');

if (gallery && typeof viewer?.showModal === 'function') {
  const maps = Array.from(gallery.querySelectorAll('a'));
  const picture = viewer.querySelector('[data-map-full]');
  const caption = viewer.querySelector('h2');
  const original = viewer.querySelector('[data-map-original]');
  let active = 0;

  function showMap(index) {
    active = (index + maps.length) % maps.length;
    const map = maps[active];
    const title = map.querySelector('img').alt;
    caption.textContent = title;
    picture.alt = title;
    picture.src = map.href;
    original.href = map.href;
  }

  maps.forEach((map, index) => {
    map.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      showMap(index);
      viewer.showModal();
    });
  });

  viewer.querySelector('[data-map-previous]').addEventListener('click', () => showMap(active - 1));
  viewer.querySelector('[data-map-next]').addEventListener('click', () => showMap(active + 1));
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showMap(active - 1);
    if (event.key === 'ArrowRight') showMap(active + 1);
  });
}

const scrollSections = document.querySelectorAll('[data-scroll-reveal]');

if (scrollSections.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('scroll-revealed');
      observer.unobserve(entry.target);
    }
  });

  scrollSections.forEach((section) => observer.observe(section));
}

const sectionMenu = document.querySelector('.section-nav');

if (sectionMenu) {
  const sections = Array.from(sectionMenu.querySelectorAll('a[href^="#"]'), (link) => ({
    link,
    target: document.getElementById(link.hash.slice(1)),
  })).filter(({ target }) => target);
  const menuList = sectionMenu.querySelector('ul');
  let scheduled = false;
  let previous;

  function updateSection() {
    scheduled = false;
    const readingLine = sectionMenu.getBoundingClientRect().bottom + 24;
    const atEnd = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight;
    let current = sections[0];

    for (const section of sections) {
      if (section.target.getBoundingClientRect().top <= readingLine || atEnd) current = section;
    }

    if (current === previous) return;
    previous = current;

    for (const section of sections) {
      if (section === current) section.link.setAttribute('aria-current', 'location');
      else section.link.removeAttribute('aria-current');
    }

    if (current && menuList.scrollWidth > menuList.clientWidth) {
      const menuBounds = menuList.getBoundingClientRect();
      const linkBounds = current.link.getBoundingClientRect();
      if (linkBounds.right > menuBounds.right) menuList.scrollLeft += linkBounds.right - menuBounds.right;
      if (linkBounds.left < menuBounds.left) menuList.scrollLeft += linkBounds.left - menuBounds.left;
    }
  }

  function scheduleSectionUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateSection);
  }

  window.addEventListener('scroll', scheduleSectionUpdate, { passive: true });
  window.addEventListener('resize', scheduleSectionUpdate);
  window.addEventListener('pageshow', scheduleSectionUpdate);
  updateSection();
}
