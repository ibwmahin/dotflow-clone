document.addEventListener("DOMContentLoaded", () => {
  console.log("Script loaded at 09:55 PM +06, June 22, 2025");

  const canvas = document.getElementById("drawflow");
  console.log("Canvas:", canvas);
  const sidebar = document.getElementById("sidebar");
  console.log("Sidebar:", sidebar);
  const connectionCanvas = document.getElementById("connection-canvas");
  console.log("Connection Canvas:", connectionCanvas);
  let scale = 1;
  const connections = new Map();
  let connectMode = false;
  let sourceNode = null;

  connectionCanvas.width = canvas.offsetWidth;
  connectionCanvas.height = canvas.offsetHeight;

  if (!canvas || !sidebar || !connectionCanvas) {
    console.error("Canvas, Sidebar, or Connection Canvas not found!");
  } else {
    console.log("Elements found, setting up events...");
  }

  // Prevent connection canvas from blocking events
  connectionCanvas.style.pointerEvents = "none";

  function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const precanvas = canvas.querySelector(".drawflow") || canvas;
    const transform = window.getComputedStyle(precanvas).transform;
    const matrix = new DOMMatrix(transform);
    const translateX = matrix.m41;
    const translateY = matrix.m42;
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const canvasX = (screenX - translateX) / scale;
    const canvasY = (screenY - translateY) / scale;
    return { x: canvasX, y: canvasY };
  }

  function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener("mousedown", (e) => {
      console.log("Mouse down on draggable");
      if (e.button === 0) {
        e.preventDefault();
        isDragging = true;
        const rect = element.getBoundingClientRect();
        initialX =
          rect.left - canvas.getBoundingClientRect().left + window.scrollX;
        initialY =
          rect.top - canvas.getBoundingClientRect().top + window.scrollY;
        const style = window.getComputedStyle(element);
        const transform = new WebKitCSSMatrix(
          style.transform || style.webkitTransform,
        );
        if (transform) {
          initialX += transform.m41 + element.offsetWidth / 2;
          initialY += transform.m42 + element.offsetHeight / 2;
        }
        startX = e.clientX;
        startY = e.clientY;
        updateConnections();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        console.log("Dragging...");
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        element.style.left = `${initialX + dx}px`;
        element.style.top = `${initialY + dy}px`;
        element.style.transform = "none";
        updateConnections();
      }
    });

    document.addEventListener("mouseup", () => {
      console.log("Mouse up");
      isDragging = false;
      updateConnections();
    });
  }

  function updateConnections() {
    const ctx = connectionCanvas.getContext("2d");
    if (!ctx) {
      console.error("Connection Canvas 2D context not available!");
      return;
    }
    ctx.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);

    const canvasRect = canvas.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    console.log("Drawing", connections.size, "connections");
    connections.forEach((conn, key) => {
      console.log("Drawing connection:", key);
      const fromRect = conn.from.getBoundingClientRect();
      const toRect = conn.to.getBoundingClientRect();
      if (isNaN(fromRect.left) || isNaN(toRect.left)) {
        console.warn("Invalid rect for connection:", key);
        return;
      }
      const fromX = fromRect.left + fromRect.width / 2 - canvasRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - canvasRect.top;
      const toX = toRect.left + toRect.width / 2 - canvasRect.left;
      const toY = toRect.top + toRect.height / 2 - canvasRect.top;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;

      const dx = toX - fromX;
      const dy = toY - fromY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 200) {
        const slope = dy / dx || 0;
        let controlX1, controlY1, controlX2, controlY2;

        if (Math.abs(dx) > Math.abs(dy)) {
          controlX1 = fromX + canvasWidth / 4;
          controlY1 = fromY;
          controlX2 = toX - canvasWidth / 4;
          controlY2 = toY;
        } else {
          controlX1 = fromX;
          controlY1 = fromY + canvasHeight / 4;
          controlX2 = toX;
          controlY2 = toY - canvasHeight / 4;
        }

        ctx.moveTo(fromX / scale, fromY / scale);
        ctx.quadraticCurveTo(
          controlX1 / scale,
          controlY1 / scale,
          toX / scale,
          toY / scale,
        );
      } else {
        ctx.moveTo(fromX / scale, fromY / scale);
        ctx.lineTo(toX / scale, toY / scale);
      }

      ctx.stroke();
    });
  }

  // Make sidebar nodes draggable
  document.querySelectorAll(".node-item").forEach((node) => {
    console.log("Setting dragstart on node:", node);
    node.setAttribute("draggable", "true");
    node.addEventListener("dragstart", (e) => {
      console.log("Drag start on node:", node.dataset.nodeType);
      e.dataTransfer.setData("text/plain", node.dataset.nodeType);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setDragImage(node, 10, 10);
    });
    node.addEventListener("dragend", (e) => {
      console.log("Drag end on node:", node.dataset.nodeType);
    });
  });

  // Set up canvas as drop target
  canvas.addEventListener("dragenter", (e) => {
    console.log("Drag enter canvas");
    e.preventDefault();
  });

  canvas.addEventListener("dragover", (e) => {
    console.log("Drag over canvas");
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    canvas.style.position = "relative";
    canvas.style.zIndex = "10";
    connectionCanvas.style.pointerEvents = "none";
  });

  canvas.addEventListener("drop", (e) => {
    console.log("Drop on canvas");
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("text/plain");
    if (!nodeType) {
      console.log("No node type data");
      return;
    }
    console.log("Dropping node type:", nodeType);
    const title = document.querySelector(
      `[data-node-type="${nodeType}"] h3`,
    ).innerText;
    const { x: posX, y: posY } = getCanvasCoordinates(e);
    const node = document.createElement("div");
    node.className = "drawflow-node";
    node.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID
    node.innerHTML = `
      <div class="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-3 rounded-lg border border-gray-700/50 relative shadow-lg cursor-pointer">
        <span class="font-medium text-sm">${title}</span>
        <button class="delete-node absolute top-1 right-1 w-6 h-6 bg-red-500/70 hover:bg-red-600/70 text-white rounded-full flex items-center justify-center">X</button>
      </div>
    `;
    node.style.position = "absolute";
    node.style.left = `${posX}px`;
    node.style.top = `${posY}px`;
    node.style.transform = "none";
    canvas.appendChild(node);
    node.addEventListener("click", handleNodeClick);
    makeDraggable(node);
    updateConnections();
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-node")) {
      console.log("Delete button clicked");
      const node = e.target.closest(".drawflow-node");
      node.remove();
      connections.forEach((conn, key) => {
        if (conn.from === node || conn.to === node) {
          connections.delete(key);
        }
      });
      updateConnections();
    }
  });

  function handleNodeClick(e) {
    const node = e.currentTarget;
    console.log("Node clicked:", node.id, "Connect mode:", connectMode);
    if (connectMode) {
      e.preventDefault();
      e.stopPropagation();
      if (!sourceNode) {
        sourceNode = node;
        console.log("Selected source node:", sourceNode.id);
        sourceNode.style.border = "2px solid orange"; // Visual feedback
      } else if (sourceNode !== node) {
        const key = [sourceNode.id, node.id].sort().join("-");
        console.log("Connecting:", key);
        connections.set(key, { from: sourceNode, to: node });
        sourceNode.style.border = ""; // Reset source border
        node.style.border = ""; // Reset target border
        sourceNode = null;
        updateConnections();
      } else {
        sourceNode.style.border = ""; // Deselect if same node clicked
        sourceNode = null;
      }
      return;
    }
  }

  function toggleConnectMode() {
    connectMode = !connectMode;
    console.log("Connect mode toggled to:", connectMode);
    if (!connectMode && sourceNode) {
      sourceNode.style.border = ""; // Reset if mode is turned off
      sourceNode = null;
    }
    const connectBtn = document.getElementById("connect-btn");
    if (connectBtn) {
      connectBtn.textContent = connectMode ? "Cancel Connect" : "Connect";
    } else {
      console.error("Connect button not found!");
    }
  }

  // Ensure connect button is present and functional
  const connectBtn = document.getElementById("connect-btn");
  if (connectBtn) {
    connectBtn.addEventListener("click", toggleConnectMode);
    console.log("Connect button attached");
  } else {
    console.error("Connect button not found in DOM!");
  }

  function showSidebar() {
    sidebar.classList.remove("hidden");
    requestAnimationFrame(() => {
      sidebar.classList.remove("translate-x-full");
    });
  }

  function hideSidebar() {
    sidebar.classList.add("translate-x-full");
  }

  document.getElementById("add-btn").addEventListener("click", () => {
    console.log("Add button clicked");
    if (sidebar.classList.contains("translate-x-full")) {
      showSidebar();
    } else {
      hideSidebar();
    }
  });

  document.getElementById("close-btn").addEventListener("click", () => {
    console.log("Close button clicked");
    hideSidebar();
  });

  sidebar.addEventListener("transitionend", (e) => {
    if (
      e.propertyName === "transform" &&
      sidebar.classList.contains("translate-x-full")
    ) {
      sidebar.classList.add("hidden");
    }
  });

  document.getElementById("add-text-btn").addEventListener("click", () => {
    console.log("Add text button clicked, checking input...");
    const textInput = document.getElementById("text-input");
    console.log("Text input element:", textInput);
    const text = textInput.value.trim();
    console.log("Input value:", text);
    if (text) {
      console.log("Creating text node...");
      const textElement = document.createElement("div");
      textElement.className = "drawflow-node";
      textElement.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID
      textElement.innerHTML = `
        <div class="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-3 rounded-lg border border-gray-700/50 relative shadow-lg">
          <span class="font-medium text-sm">${text}</span>
          <button class="delete-node absolute top-1 right-1 w-6 h-6 bg-red-500/70 hover:bg-red-600/70 text-white rounded-full flex items-center justify-center">X</button>
        </div>
      `;
      textElement.style.position = "absolute";
      textElement.style.left = "50%";
      textElement.style.top = "50%";
      textElement.style.transform = "translate(-50%, -50%)";
      canvas.appendChild(textElement);
      textElement.addEventListener("click", handleNodeClick);
      makeDraggable(textElement);
      updateConnections();
      textInput.value = "";
      console.log("Text node created and input cleared.");
    } else {
      console.log("No text entered, skipping node creation.");
    }
  });

  document.getElementById("maximize-btn").addEventListener("click", () => {
    console.log("Maximize button clicked");
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      canvas.requestFullscreen().catch((err) => console.error(err));
    }
  });

  document.getElementById("zoom-in-btn").addEventListener("click", () => {
    console.log("Zoom in button clicked");
    scale *= 1.1;
    canvas.style.transform = `scale(${scale}) translate(0, 0)`;
    connectionCanvas.style.transform = `scale(${scale}) translate(0, 0)`;
    updateConnections();
  });

  document.getElementById("zoom-out-btn").addEventListener("click", () => {
    console.log("Zoom out button clicked");
    scale /= 1.1;
    canvas.style.transform = `scale(${scale}) translate(0, 0)`;
    connectionCanvas.style.transform = `scale(${scale}) translate(0, 0)`;
    updateConnections();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    console.log("Reset button clicked");
    canvas.innerHTML = "";
    connections.clear();
    scale = 1;
    canvas.style.transform = `scale(${scale}) translate(0, 0)`;
    connectionCanvas.style.transform = `scale(${scale}) translate(0, 0)`;
    connectionCanvas.width = canvas.offsetWidth;
    connectionCanvas.height = canvas.offsetHeight;
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    console.log("Search input changed");
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll(".node-item").forEach((node) => {
      const title = node.querySelector("h3").innerText.toLowerCase();
      node.style.display = title.includes(searchTerm) ? "flex" : "none";
    });
  });
});
