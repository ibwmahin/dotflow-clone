Modern Workflow Editor
Overview
The Modern Workflow Editor is a web-based tool designed to create and visualize workflow diagrams. It allows users to drag and drop nodes (representing tasks or processes) onto a canvas, manually connect them to define relationships, and manage the layout with interactive controls. This tool is ideal for designing workflows, such as AI agent processes, email automation, or data processing pipelines, with a modern, intuitive interface.
Features

Drag-and-Drop Nodes: Add pre-defined nodes (e.g., "AI Agent," "Send Email," "Data Process") or custom text nodes.
Manual Connections: Connect nodes by selecting them in connect mode to define workflow relationships.
Interactive Controls: Zoom, reset, maximize, and manage nodes with a user-friendly control panel.
Searchable Sidebar: Filter nodes using a search input in the sidebar.
Dynamic Canvas: Move nodes and see connections update in real-time.

Prerequisites

A modern web browser (e.g., Chrome, Firefox, Edge).
Internet connection for loading Tailwind CSS via CDN.

Installation

Clone or download the project files to your local machine.
Ensure the following files are in the same directory:
raw.html
raw.js
raw.css (optional, for additional custom styling)


Open raw.html in a web browser to start using the editor.

How to Use
1. Adding Nodes

Click the "Add" button (top right) to open the sidebar.
Drag nodes (e.g., "AI Agent," "Send Email," "Data Process") from the sidebar onto the canvas.
Alternatively, type text in the "Add your text..." input (top left) and click "Add" to create a custom node.

2. Moving Nodes

Click and drag any node on the canvas to reposition it. Connections will adjust dynamically.

3. Connecting Nodes

Click the "Connect" button (bottom left) to enter connect mode (button changes to "Cancel Connect").
Click the first node to select it as the source (it will show an orange border).
Click the second node to create a connection (a line will appear, and borders will reset).
Click "Cancel Connect" to exit connect mode without connecting.

4. Deleting Nodes

Click the "X" button on any node to remove it and its connections.

5. Using Controls

Maximize: Toggle full-screen mode.
Zoom In/Out: Adjust the canvas zoom level.
Reset: Clear the canvas and reset the zoom.
Search: Use the sidebar search input to filter nodes.

Customization

Modify raw.js to add new node types or adjust connection logic.
Update raw.css to change the visual styling of nodes or the canvas.
Add more nodes to the sidebar by editing the #node-list section in raw.html.

Troubleshooting

No Connections Appear: Ensure the "Connect" button is clicked before selecting nodes. Check the browser console (F12) for errors.
Nodes Not Draggable: Verify raw.js is loading correctly and the draggable="true" attribute is present on .node-item elements.
Performance Issues: Reduce the number of nodes or optimize raw.js for larger workflows.

License
This project is open-source. Feel free to use, modify, and distribute it under the MIT License (or specify your preferred license here).
Acknowledgments
Built with assistance from xAI's Grok, leveraging Tailwind CSS for styling and modern JavaScript for interactivity.
