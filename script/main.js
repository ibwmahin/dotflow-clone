const node = document.querySelector('.node')

let offsetX, offsetY;


node.addEventListener('dragstart', (e) => {
  offsetX = e.offsetX;
  offsetY = e.offsetY;
})


document.getElementById("canvas").addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.getElementById("canvas").addEventListener("drop", (e) => {
  e.preventDefault();

  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;

  node.style.left = x + "px";
  node.style.top = y + "px";
});
