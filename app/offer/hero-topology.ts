// Delivery chain drawn in the offer hero, reused by the live system scene.
const nodes = [
  { label: "Code", x: 150, y: 78, width: 64, dx: 28, dy: -22 },
  { label: "CI", x: 220, y: 220, width: 44, dx: 32, dy: 8 },
  { label: "Registry", x: 410, y: 280, width: 92, dx: 30, dy: -22 },
  { label: "ArgoCD", x: 555, y: 325, width: 78, dx: 32, dy: -18 },
  { label: "EKS", x: 620, y: 430, width: 52, dx: 28, dy: -16 },
  { label: "Metrics", x: 495, y: 505, width: 82, dx: 28, dy: 34 },
];

const backgroundNodes = [
  [96, 370],
  [300, 112],
  [570, 112],
  [120, 500],
  [318, 472],
  [532, 392],
];

const backgroundLinks = [
  [150, 78, 300, 112],
  [300, 112, 570, 112],
  [570, 112, 620, 430],
  [220, 220, 96, 370],
  [220, 220, 300, 112],
  [220, 220, 410, 280],
  [96, 370, 318, 472],
  [318, 472, 532, 392],
  [410, 280, 532, 392],
  [532, 392, 620, 430],
];

export const heroTopology = { nodes, backgroundNodes, backgroundLinks };
