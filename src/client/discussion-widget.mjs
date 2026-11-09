export function mountDiscussionWidget(widget) {
  const link = widget.querySelector("[data-discussion-link]");
  const topic = widget.querySelector("[data-discussion-topic]");
  const base = { href: link.getAttribute("href"), label: topic.textContent };
  const main = document.getElementById("inhalt");
  const markers = new Map(Array.from(main.querySelectorAll("[data-forum-section]"),
    marker => [marker.dataset.forumSection, marker]));
  const sections = JSON.parse(widget.dataset.discussionSections).flatMap(section => {
    const marker = markers.get(section.id);
    const anchor = document.getElementById(section.anchor);
    const element = anchor ?? marker;
    if (!element || !main.contains(element)) return [];
    const region = element.closest("[data-forum-region], section, article, li, details") ?? element;
    return [{ ...section, region, anchor }];
  });
  const visible = new Set(sections);
  const byAnchor = new Map(sections.filter(section => section.anchor).map(section => [section.anchor.id, section]));
  const byRegion = new Map();
  for (const section of sections) {
    if (!byRegion.has(section.region)) byRegion.set(section.region, []);
    byRegion.get(section.region).push(section);
  }

  function setDestination(destination) {
    if (link.getAttribute("href") !== destination.href) link.setAttribute("href", destination.href);
    if (topic.textContent !== destination.label) topic.textContent = destination.label;
  }

  function update() {
    if (widget.contains(document.activeElement)) return;

    const readingLine = window.innerHeight * .35;
    const inlineCenter = document.documentElement.clientWidth / 2;
    const focused = document.activeElement;
    const atHash = byAnchor.get(window.location.hash.slice(1));
    const candidates = new Set(visible);
    if (atHash) candidates.add(atHash);
    for (let element = focused; element && element !== main; element = element.parentElement) {
      for (const section of byRegion.get(element) ?? []) candidates.add(section);
    }
    let nearest;
    let nearestPriority = -1;
    let nearestRank = Infinity;

    for (const section of candidates) {
      const rect = section.region.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || rect.bottom <= 0 || rect.top >= window.innerHeight) continue;
      const hashTop = section === atHash ? section.anchor.getBoundingClientRect().top : -1;
      const priority = hashTop >= 0 && hashTop < window.innerHeight ? 2 : section.region.contains(focused) ? 1 : 0;
      if (priority < nearestPriority || (!priority && (rect.top > readingLine || rect.bottom < readingLine))) continue;
      if (priority === 1 && nearestPriority === 1 && section.region !== nearest.region) {
        if (section.region.contains(nearest.region)) continue;
        if (nearest.region.contains(section.region)) nearestRank = Infinity;
      }
      // Among equally relevant regions, prefer the one nearest the reading line and viewport center.
      const rank = Math.abs(readingLine - rect.top) * 2 + Math.abs((rect.left + rect.right) / 2 - inlineCenter) / inlineCenter;
      if (priority > nearestPriority || rank < nearestRank) {
        nearest = section;
        nearestPriority = priority;
        nearestRank = rank;
      }
    }

    setDestination(nearest ?? base);
  }

  let frame;
  function scheduleUpdate() {
    if (frame !== undefined) return;
    frame = window.requestAnimationFrame(() => {
      frame = undefined;
      update();
    });
  }

  document.addEventListener("focusin", event => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || widget.contains(target)) return;

    // Prevent the floating link from obscuring a control reached by the keyboard.
    window.requestAnimationFrame(() => {
      if (document.activeElement !== target || target === main) return;
      const style = getComputedStyle(widget);
      if (style.position !== "fixed" || style.visibility === "hidden" || style.opacity === "0") return;
      const control = target.getBoundingClientRect();
      const dock = widget.getBoundingClientRect();
      if (control.right > dock.left && control.left < dock.right && control.bottom > dock.top && control.top < dock.bottom) {
        target.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
      }
    });
    scheduleUpdate();
  });

  if (sections.length === 0) return;

  if (typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        for (const section of byRegion.get(entry.target)) {
          if (entry.isIntersecting) visible.add(section);
          else visible.delete(section);
        }
      }
      scheduleUpdate();
    }, { rootMargin: "120px 0px" });
    for (const region of byRegion.keys()) observer.observe(region);
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  if (typeof ResizeObserver === "function") new ResizeObserver(scheduleUpdate).observe(main);
  scheduleUpdate();
}
