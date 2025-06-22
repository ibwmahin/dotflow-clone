// Initialize Drawflow
const editor = new Drawflow(document.getElementById("drawflow"));
editor.start();

const canvas = document.getElementById("drawflow");
const sidebar = document.getElementById("sidebar");

// Function to get canvas coordinates considering zoom and pan
function getCanvasCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  const precanvas = canvas.querySelector(".drawflow");
  const transform = window.getComputedStyle(precanvas).transform;
  const matrix = new DOMMatrix(transform);
  const translateX = matrix.m41;
  const translateY = matrix.m42;
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;
  const canvasX = (screenX - translateX) / editor.zoom;
  const canvasY = (screenY - translateY) / editor.zoom;
  return { x: canvasX, y: canvasY };
}

// Node drag-and-drop from sidebar
document.querySelectorAll(".node-item").forEach((node) => {
  node.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("node-type", node.dataset.nodeType);
  });
});

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  const nodeType = e.dataTransfer.getData("node-type");
  if (!nodeType) return;
  const title = document.querySelector(
    `[data-node-type="${nodeType}"] h3`,
  ).innerText;
  const { x: posX, y: posY } = getCanvasCoordinates(e);
  editor.addNode(
    nodeType,
    1,
    1,
    posX,
    posY,
    nodeType,
    { title },
    `
    <div class="bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-3 rounded-lg border border-gray-700/50 relative shadow-lg">
      <span class="font-medium text-sm">${title}</span>
      <button class="delete-node absolute top-1 right-1 w-6 h-6 bg-red-500/70 hover:bg-red-600/70 text-white rounded-full flex items-center justify-center transition-colors duration-200">X</button>
    </div>
  `,
  );
});

// Dynamic delete button listener with right-click
editor.on("nodeCreated", (id) => {
  const node = document.getElementById(`node-${id}`);
  if (node) {
    const deleteBtn = node.querySelector(".delete-node");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent any default behavior
        e.stopPropagation(); // Stop Drawflow from handling the click
        editor.removeNodeId(`node-${id}`); // Delete the node
      });
    }
  }
});

// Sidebar functions
function showSidebar() {
  sidebar.classList.remove("hidden");
  requestAnimationFrame(() => {
    sidebar.classList.remove("translate-x-full");
  });
}

function hideSidebar() {
  sidebar.classList.add("translate-x-full");
}

// Toggle Sidebar with add button
document.getElementById("add-btn").addEventListener("click", () => {
  if (sidebar.classList.contains("translate-x-full")) {
    showSidebar();
  } else {
    hideSidebar();
  }
});

// Close Sidebar with close button
document.getElementById("close-btn").addEventListener("click", () => {
  hideSidebar();
});

// Hide sidebar completely after transition
sidebar.addEventListener("transitionend", (e) => {
  if (
    e.propertyName === "transform" &&
    sidebar.classList.contains("translate-x-full")
  ) {
    sidebar.classList.add("hidden");
  }
});

// Add Text to Canvas with improved drag control
document.getElementById("add-text-btn").addEventListener("click", () => {
  const text = document.getElementById("text-input").value.trim();
  if (text) {
    const textElement = document.createElement("div");
    textElement.className =
      "text-label absolute bg-gray-800/70 text-white p-2 rounded-lg border border-gray-700/50 shadow-md cursor-move select-none";
    textElement.innerText = text;
    textElement.style.left = "50%";
    textElement.style.top = "50%";
    textElement.style.transform = "translate(-50%, -50%)";
    textElement.setAttribute("draggable", "false"); // Prevent default drag behavior
    canvas.appendChild(textElement);

    let isDragging = false,
      startX,
      startY,
      initialX,
      initialY;
    textElement.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        // Left click only for drag
        e.preventDefault(); // Prevent text selection and focus issues
        e.stopPropagation(); // Prevent canvas events
        isDragging = true;
        initialX =
          textElement.getBoundingClientRect().left -
          canvas.getBoundingClientRect().left;
        initialY =
          textElement.getBoundingClientRect().top -
          canvas.getBoundingClientRect().top;
        startX = e.clientX;
        startY = e.clientY;
        textElement.style.transition = "none"; // Disable transition during drag
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        textElement.style.left = `${initialX + dx}px`;
        textElement.style.top = `${initialY + dy}px`;
        textElement.style.transform = "none";
      }
    });
    document.addEventListener("mouseup", () => {
      if (isDragging) {
        textElement.style.transition = "transform 0.2s ease"; // Re-enable transition
      }
      isDragging = false;
    });
    // Clear input focus after adding
    document.getElementById("text-input").value = "";
    document.getElementById("text-input").blur();
  }
});

// Control Buttons
document.getElementById("maximize-btn").addEventListener("click", () => {
  const elem = canvas;
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch((err) => console.error(err));
  } else {
    document.exitFullscreen();
  }
});

document.getElementById("zoom-in-btn").addEventListener("click", () => {
  editor.zoom_in();
});

document.getElementById("zoom-out-btn").addEventListener("click", () => {
  editor.zoom_out();
});

document.getElementById("reset-btn").addEventListener("click", () => {
  editor.clear();
  document.querySelectorAll(".text-label").forEach((el) => el.remove());
});

// Search Functionality
document.getElementById("search-input").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll(".node-item").forEach((node) => {
    const title = node.querySelector("h3").innerText.toLowerCase();
    node.style.display = title.includes(searchTerm) ? "flex" : "none";
  });
});
