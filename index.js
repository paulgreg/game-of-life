const width = window.innerWidth;
const height = window.innerHeight;

const buffer = new OffscreenCanvas(width, height);
const screen = document.querySelector("#screen");

const bufferCtx = buffer.getContext("2d", { alpha: false });
const screenCtx = screen.getContext("2d", { alpha: false });

const middleWidth = Math.round(width / 2);
const middleHeight = Math.round(height / 2);

const bufferCells = new Uint8Array(width * height);
const cells = new Uint8Array(width * height);
const nextCells = new Uint8Array(width * height);

const EMPTY = 0;
const ALIVE = 1;
const DEAD = 2;

const getCell = (x, y, array = cells) => {
  if (x < 0 || y < 0 || x > width || y > height) return EMPTY;
  return array[y * width + x];
};

const getNeighbors = (x, y) => {
  const a = getCell(x - 1, y - 1);
  const b = getCell(x + 0, y - 1);
  const c = getCell(x + 1, y - 1);
  const d = getCell(x - 1, y + 0);
  const e = getCell(x + 1, y + 0);
  const f = getCell(x - 1, y + 1);
  const g = getCell(x + 0, y + 1);
  const h = getCell(x + 1, y + 1);
  return [a, b, c, d, e, f, g, h];
};

const countNeighbors = (x, y) => getNeighbors(x, y).reduce((acc, cell) => acc + (cell === ALIVE ? 1 : 0), 0);

const setCell = (x, y, status, array = cells) => (array[y * width + x] = status);

const setCells = (x1, y1, x2, y2, status) => {
  for (let x = x1; x < x2; x++) {
    for (let y = y1; y < y2; y++) {
      setCell(x, y, status);
    }
  }
};

const randomizeCells = () => {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (Math.random() > 0.5) {
        setCell(x, y, ALIVE);
      }
    }
  }
};
const updateCells = () => {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const n = countNeighbors(x, y);
      const status = getCell(x, y);
      if (status === ALIVE && (n < 2 || n > 3)) {
        setCell(x, y, DEAD, nextCells);
      } else if (n === 3) {
        setCell(x, y, ALIVE, nextCells);
      } else if (status === ALIVE && n > 3) {
        setCell(x, y, DEAD, nextCells);
      } else {
        setCell(x, y, EMPTY, nextCells);
      }
    }
  }
};

const getColor = (status) => {
  switch (status) {
    case ALIVE:
      return "green";
    case DEAD:
      return "white";
    case EMPTY:
    default:
      return "white";
  }
};

const draw = () => {
  const startRendering = Date.now();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const status = getCell(x, y);
      const color = getColor(status);
      if (getCell(x, y, bufferCells) !== status) {
        bufferCtx.fillStyle = color;
        bufferCtx.fillRect(x, y, 1, 1);
        setCell(x, y, status, bufferCells);
      }
    }
  }
  console.log("rendering time", Date.now() - startRendering);
  const startDraw = Date.now();
  screenCtx.drawImage(buffer, 0, 0);
  console.log("drawing time", Date.now() - startDraw);
};

const init = () => {
  screen.width = width;
  screen.height = height;

  cells.fill(EMPTY);
  bufferCells.fill(EMPTY);

  // Draw alive cells
  randomizeCells();

  // set canvas to white
  bufferCtx.fillStyle = "white";
  bufferCtx.fillRect(0, 0, width, height);
};

const doLoop = () => {
  updateCells();
  cells.set(nextCells);
  draw();
  setTimeout(doLoop, 250);
};

const start = () => {
  doLoop();
};

init();
start();
