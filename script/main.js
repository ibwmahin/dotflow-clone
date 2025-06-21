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
  const nodeId = editor.addNode(
    nodeType,
    1,
    1,
    posX,
    posY,
    nodeType,
    { title },
    `
        <div class="bg-gray-700 p-2 rounded border border-gray-600 relative">
          ${title}
          <button class="delete-node absolute top-0 right-0 p-1 text-red-500 hover:text-red-700">X</button>
        </div>
      `,
  );

  // Add delete button click handler for the newly created node
  const nodeElement = document.getElementById(`node-${nodeId}`);
  if (nodeElement) {
    const deleteButton = nodeElement.querySelector(".delete-node");
    if (deleteButton) {
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent Drawflow events from interfering
        editor.removeNodeId(nodeId.toString());
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

//Toggle Sidebar with add button
document.getElementById("add-btn").addEventListener("click", () => {
  if (sidebar.classList.contains("translate-x-full")) {
    showSidebar();
  } else {
    hideSidebar();
  }
});

//close sidebar with close button

document.getElementById("close-btn").addEventListener("click", () => {
  hideSidebar();
});

// Totally hideSidebar form the screen

sidebar.addEventListener("transitionend", (e) => {
  if (
    e.propertyName === "transform" &&
    sidebar.classList.contains("translate-x-full")
  ) {
    sidebar.classList.add("hidden");
  }
});

document.getElementById("add-textt-btn").addEventListener("click", () => {
  const text = document.getElementById("text-input").value.trim();

  if (text) {
    const textElement = document.createElement("div");
    textElement.className =
      "text-label absolute bg-gray-800 text-white p-2 border border-gray-600";

    textElement.innerText = text;
    textElement.style.left = "50%";
    textElement.style.top = "50%";
    textElement.style.transform = "translate(-50%,-50%)";

    canvas.appendChild(textElement);
    // draging;

    let isDraggingg = false,
      startX,
      startY;
    textElement.addEventListener("mousedown", (e) => {
      isDraggingg = true;
      startX = e.clientX - parseFloat(textElement.style.left || 0);
      startY = e.clientY - parseFloat(textElement.style.top || 0);
    });

    // moving

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        textElement.style.left = `${e.clientX - startX}px`;
        textElement.style.top = `${e.clientY - startY}px`;
      }
    });

    // draggin off

    document.addEventListener("mouseup", () => {
      isDraggingg = false;
    });

    // text - input

    document.getElementById("text-input").value = "";
  }
});
