// taking the variable by the getElementById
const editor = new DrawFlow(document.getElementsByClassName("drawflow"));
editor.start();
const canvas = document.getElementById("drawflow");
const sidebar = document.getElementById("sidebar");

function gatCanvasCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  const precanvas = canvas.querySelector(".drawflow");
}
