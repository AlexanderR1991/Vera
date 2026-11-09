const namespace = "http://www.w3.org/2000/svg";
const parentOf = path => path.slice(0, Math.max(0, path.lastIndexOf("/")));

function element(name, attributes = {}) {
  const node = document.createElementNS(namespace, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

export function createRepositoryGraph(svg, {onSelect, rootLabel, folderLabel}) {
  const edges = element("g", {"aria-hidden": "true"});
  const points = element("g");
  svg.append(edges, points);

  const nodes = new Map();
  const height = 520;
  let width = 780;
  let viewportWidth = width;
  let camera = {x: width / 2, y: height / 2, zoom: 1};
  let entries;
  let selected = "";
  let focused = "";
  let drag;

  function paintView() {
    const halfWidth = width / (2 * camera.zoom);
    const halfHeight = height / (2 * camera.zoom);
    camera.x = Math.max(halfWidth, Math.min(width - halfWidth, camera.x));
    camera.y = Math.max(halfHeight, Math.min(height - halfHeight, camera.y));
    svg.setAttribute("viewBox", `${camera.x - halfWidth} ${camera.y - halfHeight} ${2 * halfWidth} ${2 * halfHeight}`);
    svg.classList.toggle("is-zoomed", camera.zoom > 1);
  }

  function bringIntoView(path) {
    const node = nodes.get(path);
    if (!node) return;
    if (Math.abs(node.x - camera.x) > width * .44 / camera.zoom ||
        Math.abs(node.y - camera.y) > height * .44 / camera.zoom) {
      camera = {...camera, x: node.x, y: node.y};
      paintView();
    }
  }

  function paintLabels() {
    const compact = viewportWidth < 520;
    const size = Math.max(13, 11 * width / viewportWidth);
    const limit = compact ? 13 : 20;
    for (const node of nodes.values()) {
      const visible = !node.path || node.depth === 1 || node.path === focused ||
        node.path === selected || (node.path && selected.startsWith(node.path + "/")) ||
        ((!compact || camera.zoom > 1) && node.parent?.path === selected);
      const offset = compact && node.depth === 1 ? (node.x - width / 2) / width : 0;
      const side = Math.abs(offset) > .045 ? Math.sign(offset) : 0;
      node.label.setAttribute("display", visible ? "inline" : "none");
      node.label.setAttribute("font-size", size);
      node.label.setAttribute("text-anchor", side < 0 ? "end" : side > 0 ? "start" : "middle");
      node.label.setAttribute("x", side * (node.radius + 4));
      node.label.setAttribute("y", side ? size * .32 : node.radius + size);
      node.label.textContent = node.name.length > limit ? node.name.slice(0, limit - 1) + "…" : node.name;
    }
  }

  function paintSelection() {
    for (const node of nodes.values()) {
      const active = node.path === selected;
      const ancestor = !active && (!node.path || selected.startsWith(node.path + "/"));
      node.group.setAttribute("aria-pressed", String(active));
      node.group.setAttribute("tabindex", node.path === focused ? "0" : "-1");
      node.group.classList.toggle("is-selected", active);
      node.group.classList.toggle("is-ancestor", ancestor);
      node.edge?.classList.toggle("is-ancestor", active || ancestor);
    }
    paintLabels();
  }

  function layout() {
    if (!nodes.size) return;
    const bounds = svg.getBoundingClientRect();
    if (bounds.width && bounds.height) {
      const nextWidth = Math.max(430, Math.min(920, height * bounds.width / bounds.height));
      camera.x *= nextWidth / width;
      width = nextWidth;
      viewportWidth = bounds.width;
    }
    const deepest = Math.max(1, ...Array.from(nodes.values(), node => node.depth));
    const root = nodes.get("");
    root.x = width / 2;
    root.y = height / 2;

    function allocate(node, start, span) {
      const weights = node.children.map(child => node.parent ? child.leaves : Math.sqrt(child.leaves));
      const total = weights.reduce((sum, weight) => sum + weight, 0);
      let angle = start;
      node.children.forEach((child, index) => {
        const sector = span * weights[index] / total;
        const center = angle + sector / 2;
        const distance = .56 + .44 * (child.depth - 1) / Math.max(1, deepest - 1);
        child.x = root.x + Math.cos(center) * width * .38 * distance;
        child.y = root.y + Math.sin(center) * height * .39 * distance;
        allocate(child, angle, sector);
        angle += sector;
      });
    }

    allocate(root, -Math.PI * .8, Math.PI * 2);
    for (const node of nodes.values()) {
      node.group.setAttribute("transform", `translate(${node.x} ${node.y})`);
      node.target.setAttribute("r", Math.max(node.radius + 4, (node.depth <= 1 ? 16 : 8) * width / viewportWidth));
      if (node.parent) {
        node.edge.setAttribute("x1", node.parent.x);
        node.edge.setAttribute("y1", node.parent.y);
        node.edge.setAttribute("x2", node.x);
        node.edge.setAttribute("y2", node.y);
      }
    }
    paintLabels();
    paintView();
  }

  function rebuild() {
    nodes.clear();
    const directories = entries.filter(entry => entry.type === "tree" && entry.path)
      .map(entry => entry.path).sort();

    for (const path of ["", ...directories]) {
      const parent = nodes.get(parentOf(path));
      if (path && !parent) continue;
      const name = path ? path.slice(path.lastIndexOf("/") + 1) : rootLabel;
      const depth = parent ? parent.depth + 1 : 0;
      const radius = depth === 0 ? 10 : depth === 1 ? 7 : 4.5;
      const group = element("g", {
        class: "repo-graph-node" + (path ? "" : " is-root"),
        "data-repo-graph-node": path,
        "aria-label": path ? `${folderLabel}: ${path}` : rootLabel,
        role: "button"
      });
      const title = element("title");
      title.textContent = path || rootLabel;
      const dot = element("circle", {class: "repo-graph-dot", r: radius});
      const target = element("circle", {fill: "transparent"});
      const focus = element("circle", {class: "repo-graph-focus", r: radius + 5, fill: "none"});
      const label = element("text", {class: "repo-graph-label", "text-anchor": "middle", "aria-hidden": "true"});
      group.append(title, target, dot, focus, label);
      const edge = parent && element("line", {class: "repo-graph-edge", "vector-effect": "non-scaling-stroke"});
      const node = {path, name, parent, depth, radius, group, edge, label, target, children: [], leaves: 1};
      nodes.set(path, node);
      parent?.children.push(node);
    }

    for (const node of [...nodes.values()].reverse()) {
      if (node.children.length) node.leaves = node.children.reduce((sum, child) => sum + child.leaves, 0);
    }
    edges.replaceChildren(...Array.from(nodes.values(), node => node.edge).filter(Boolean));
    points.replaceChildren(...Array.from(nodes.values(), node => node.group));
    layout();
  }

  function render(nextEntries, selectedPath) {
    const hadFocus = svg.contains(document.activeElement);
    if (entries !== nextEntries) {
      entries = nextEntries;
      rebuild();
    }
    selected = nodes.has(selectedPath) ? selectedPath : "";
    focused = selected;
    paintSelection();
    bringIntoView(selected);
    if (hadFocus) nodes.get(selected)?.group.focus({preventScroll: true});
  }

  function zoomBy(factor) {
    if (camera.zoom === 1) {
      const node = nodes.get(selected);
      if (node) camera = {...camera, x: node.x, y: node.y};
    }
    camera.zoom = Math.max(1, Math.min(4, camera.zoom * factor));
    paintLabels();
    paintView();
  }

  svg.addEventListener("click", event => {
    const group = event.target.closest("[data-repo-graph-node]");
    if (group) onSelect(group.dataset.repoGraphNode);
  });

  svg.addEventListener("keydown", event => {
    const group = event.target.closest("[data-repo-graph-node]");
    if (!group) return;
    const node = nodes.get(group.dataset.repoGraphNode);
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(node.path);
      return;
    }
    const siblings = node.parent?.children ?? [];
    const index = siblings.indexOf(node);
    const destinations = {
      ArrowUp: node.parent,
      ArrowDown: node.children[0],
      ArrowLeft: siblings[index - 1],
      ArrowRight: siblings[index + 1],
      Home: nodes.get("")
    };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    const destination = destinations[event.key];
    if (destination) {
      focused = destination.path;
      paintSelection();
      bringIntoView(focused);
      destination.group.focus({preventScroll: true});
    }
  });

  svg.addEventListener("pointerdown", event => {
    if (camera.zoom === 1 || !event.isPrimary || event.button !== 0 ||
        event.target.closest("[data-repo-graph-node]")) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
    svg.setPointerCapture(drag.id);
  });
  svg.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    const bounds = svg.getBoundingClientRect();
    const scale = camera.zoom * Math.min(bounds.width / width, bounds.height / height);
    camera.x -= (event.clientX - drag.x) / scale;
    camera.y -= (event.clientY - drag.y) / scale;
    drag.x = event.clientX;
    drag.y = event.clientY;
    paintView();
  });
  svg.addEventListener("lostpointercapture", () => { drag = undefined; });
  if (typeof ResizeObserver === "function") new ResizeObserver(layout).observe(svg);

  return {
    render,
    zoomIn: () => zoomBy(1.4),
    zoomOut: () => zoomBy(1 / 1.4),
    reset() {
      camera = {x: width / 2, y: height / 2, zoom: 1};
      paintLabels();
      paintView();
    }
  };
}
