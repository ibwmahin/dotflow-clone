document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const canvas = $("drawflow");
  const sidebar = $("sidebar");
  const connectionCanvas = $("connection-canvas");
  const connectBtn = $("connect-btn");

  if (!canvas || !sidebar || !connectionCanvas) {
    console.error("Missing core UI elements");
    return;
  }

  connectionCanvas.width = canvas.offsetWidth;
  connectionCanvas.height = canvas.offsetHeight;
  connectionCanvas.style.pointerEvents = "none";

  let scale = 1;
  let connectMode = false;
  let sourceNode = null;
  const connections = new Map();

  const generateId = () =>
    `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const getCanvasCoordinates = ({ clientX, clientY }) => {
    const rect = canvas.getBoundingClientRect();
    const precanvas = canvas.querySelector(".drawflow") || canvas;
    const matrix = new DOMMatrix(window.getComputedStyle(precanvas).transform);
    return {
      x: (clientX - rect.left - matrix.m41) / scale,
      y: (clientY - rect.top - matrix.m42) / scale,
    };
  };

  // DRAGGING LOGIC
  let currentDragNode = null;
  let dragStartX, dragStartY, initialX, initialY;

  const makeDraggable = (el) => {
    el.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const matrix = new DOMMatrix(getComputedStyle(el).transform || "none");

      initialX = rect.left - canvasRect.left + matrix.m41 + el.offsetWidth / 2;
      initialY = rect.top - canvasRect.top + matrix.m42 + el.offsetHeight / 2;

      dragStartX = e.clientX;
      dragStartY = e.clientY;
      currentDragNode = el;
    });
  };

  document.addEventListener("mousemove", (e) => {
    if (!currentDragNode) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    Object.assign(currentDragNode.style, {
      left: `${initialX + dx}px`,
      top: `${initialY + dy}px`,
      transform: "none",
    });
    updateConnections();
  });

  document.addEventListener("mouseup", () => {
    currentDragNode = null;
  });

  const updateConnections = () => {
    const ctx = connectionCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);
    const { width, height, left, top } = canvas.getBoundingClientRect();

    connections.forEach(({ from, to }) => {
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();

      const [fromX, fromY] = [
        fromRect.left + fromRect.width / 2 - left,
        fromRect.top + fromRect.height / 2 - top,
      ];
      const [toX, toY] = [
        toRect.left + toRect.width / 2 - left,
        toRect.top + toRect.height / 2 - top,
      ];

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;

      const dx = toX - fromX;
      const dy = toY - fromY;

      if (Math.hypot(dx, dy) > 200) {
        const isWide = Math.abs(dx) > Math.abs(dy);
        const [c1x, c1y] = isWide
          ? [fromX + width / 4, fromY]
          : [fromX, fromY + height / 4];
        const [c2x, c2y] = isWide
          ? [toX - width / 4, toY]
          : [toX, toY - height / 4];
        ctx.moveTo(fromX / scale, fromY / scale);
        ctx.quadraticCurveTo(
          c1x / scale,
          c1y / scale,
          toX / scale,
          toY / scale,
        );
      } else {
        ctx.moveTo(fromX / scale, fromY / scale);
        ctx.lineTo(toX / scale, toY / scale);
      }

      ctx.stroke();
    });
  };

  const createNodeElement = (content, x = "50%", y = "50%") => {
    const node = document.createElement("div");
    node.className = "drawflow-node";
    node.id = generateId();
    node.innerHTML = `
      <div class="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-3 rounded-lg border border-gray-700/50 relative shadow-lg cursor-pointer">
        <span class="font-medium text-sm">${content}</span>
        <button class="delete-node absolute -top-3 -right-3 w-6 h-6 bg-red-500/70 hover:bg-red-600 text-white rounded-full text-center flex justify-center items-center">X</button>
      </div>
    `;
    Object.assign(node.style, {
      position: "absolute",
      left: typeof x === "number" ? `${x}px` : x,
      top: typeof y === "number" ? `${y}px` : y,
      transform: typeof x === "number" ? "none" : "translate(-50%, -50%)",
    });
    canvas.appendChild(node);
    node.addEventListener("click", handleNodeClick);
    makeDraggable(node);
    updateConnections();
  };

  document.querySelectorAll(".node-item").forEach((item) => {
    item.draggable = true;
    item.ondragstart = (e) => {
      e.dataTransfer.setData("text/plain", item.dataset.nodeType);
      e.dataTransfer.setDragImage(item, 10, 10);
    };
  });

  canvas.ondragover = (e) => {
    e.preventDefault();
  };

  canvas.ondrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    const title =
      document.querySelector(`[data-node-type="${type}"] h3`)?.innerText ||
      type;
    const { x, y } = getCanvasCoordinates(e);
    createNodeElement(title, x, y);
  };

  const handleNodeClick = (e) => {
    const node = e.currentTarget;
    if (!connectMode) return;

    e.preventDefault();
    e.stopPropagation();

    if (!sourceNode) {
      sourceNode = node;
      node.style.border = "2px solid orange";
    } else if (sourceNode !== node) {
      const key = [sourceNode.id, node.id].sort().join("-");
      connections.set(key, { from: sourceNode, to: node });
      sourceNode.style.border = "";
      node.style.border = "";
      sourceNode = null;
      updateConnections();
    } else {
      sourceNode.style.border = "";
      sourceNode = null;
    }
  };

  connectBtn?.addEventListener("click", () => {
    connectMode = !connectMode;
    sourceNode?.style?.removeProperty("border");
    sourceNode = null;
    connectBtn.textContent = connectMode ? "Cancel Connect" : "Connect";
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-node")) {
      const node = e.target.closest(".drawflow-node");
      node?.remove();
      [...connections].forEach(([key, { from, to }]) => {
        if (from === node || to === node) connections.delete(key);
      });
      updateConnections();
    }
  });

  $("add-btn")?.addEventListener("click", () => {
    sidebar.classList.toggle("translate-x-full");
    sidebar.classList.toggle(
      "hidden",
      sidebar.classList.contains("translate-x-full"),
    );
  });

  $("close-btn")?.addEventListener("click", () =>
    sidebar.classList.add("translate-x-full"),
  );

  sidebar.addEventListener("transitionend", ({ propertyName }) => {
    if (
      propertyName === "transform" &&
      sidebar.classList.contains("translate-x-full")
    ) {
      sidebar.classList.add("hidden");
    }
  });

  $("add-text-btn")?.addEventListener("click", () => {
    const text = $("text-input")?.value?.trim();
    if (text) {
      createNodeElement(text);
      $("text-input").value = "";
    }
  });

  const minScale = 0.1;
  const maxScale = 10;

  const applyZoom = () => {
    [canvas, connectionCanvas].forEach(
      (el) => (el.style.transform = `scale(${scale})`),
    );
    updateConnections();
  };

  $("zoom-in-btn")?.addEventListener("click", () => {
    scale = Math.min(maxScale, scale * 1.1);
    applyZoom();
  });

  $("zoom-out-btn")?.addEventListener("click", () => {
    scale = Math.max(minScale, scale / 1.1);
    applyZoom();
  });
  $("zoom-out-btn")?.addEventListener("click", () => {
    scale /= 1.1;
    [canvas, connectionCanvas].forEach(
      (el) => (el.style.transform = `scale(${scale})`),
    );
    updateConnections();
  });

  $("reset-btn")?.addEventListener("click", () => {
    canvas.innerHTML = "";
    connections.clear();
    scale = 1;
    [canvas, connectionCanvas].forEach(
      (el) => (el.style.transform = `scale(1)`),
    );
    connectionCanvas.width = canvas.offsetWidth;
    connectionCanvas.height = canvas.offsetHeight;
  });

  $("search-input")?.addEventListener("input", ({ target }) => {
    const searchTerm = target.value.toLowerCase();
    document.querySelectorAll(".node-item").forEach((item) => {
      const title = item.querySelector("h3")?.innerText.toLowerCase() || "";
      item.style.display = title.includes(searchTerm) ? "flex" : "none";
    });
  });

  $("maximize-btn")?.addEventListener("click", () => {
    document.fullscreenElement
      ? document.exitFullscreen()
      : canvas.requestFullscreen().catch(console.error);
  });
});
