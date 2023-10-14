const params = new URLSearchParams(document.location.search);

const SCALE_RATIO = params.get("scale") ?? 2;
const LOOP = params.get("loop") ?? 0;
const BIRTH = params.get("birth") ?? 0.9;

const DEFAULT_COLOR = params.get("default") ?? "white";
const ALIVE_COLOR = params.get("alive") ?? "green";
const DEAD_COLOR = params.get("dead") ?? "yellow";

const EMPTY = 0;
const ALIVE = 1;
const DEAD = 2;

const width = Math.round(window.innerWidth / SCALE_RATIO);
const height = Math.round(window.innerHeight / SCALE_RATIO);

const output = document.querySelector("canvas");
const buffer = new OffscreenCanvas(width, height);

const outputCtx = output.getContext("2d", { alpha: false });
const bufferCtx = buffer.getContext("2d", { alpha: false });

const middleWidth = Math.round(width / 2);
const middleHeight = Math.round(height / 2);

const bufferCells = new Uint8Array(width * height);
const cells = new Uint8Array(width * height);
const nextCells = new Uint8Array(width * height);

const getCell = (x, y, array = cells) => {
  if (x < 0 || y < 0 || x > width || y > height) return EMPTY;
  return array[y * width + x];
};

const getNeighbours = (x, y) => {
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

const countNeighbours = (x, y) => getNeighbours(x, y).reduce((acc, cell) => acc + (cell === ALIVE ? 1 : 0), 0);

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
      if (Math.random() > BIRTH) {
        setCell(x, y, ALIVE);
      }
    }
  }
};

const updateCells = () => {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const n = countNeighbours(x, y);
      const status = getCell(x, y);
      if (status === ALIVE && (n < 2 || n > 3)) {
        setCell(x, y, DEAD, nextCells);
      } else if (n === 3) {
        setCell(x, y, ALIVE, nextCells);
      } else if (status === DEAD) {
        setCell(x, y, EMPTY, nextCells);
      }
    }
  }
};

const getColor = (status) => {
  switch (status) {
    case ALIVE:
      return ALIVE_COLOR;
    case DEAD:
      return DEAD_COLOR;
    case EMPTY:
    default:
      return DEFAULT_COLOR;
  }
};

const draw = () => {
  // const start = Date.now();
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
  // console.log("rendering time", Date.now() - start);
  outputCtx.drawImage(buffer, 0, 0);
};

const init = () => {
  output.width = window.innerWidth;
  output.height = window.innerHeight;

  cells.fill(EMPTY);
  bufferCells.fill(EMPTY);

  randomizeCells();

  // initialize canvas
  bufferCtx.fillStyle = DEFAULT_COLOR;
  bufferCtx.fillRect(0, 0, width, height);
  outputCtx.scale(SCALE_RATIO, SCALE_RATIO);
};

const doLoop = () => {
  updateCells();
  cells.set(nextCells);
  draw();
  if (LOOP === 0) {
    requestAnimationFrame(doLoop);
  } else {
    setTimeout(doLoop, LOOP);
  }
};

const start = () => {
  doLoop();
};

init();
start();
