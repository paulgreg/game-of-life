const params = new URLSearchParams(document.location.search);

const SCALE_RATIO = params.get("scale") ?? 4;
const LOOP = params.get("loop") ?? 0;
const BIRTH = params.get("birth") ?? 0.7;

const DEFAULT_COLOR = params.get("default") ?? "black";
const ALIVE_COLOR = params.get("alive") ?? "blue";
const DEAD_COLOR = params.get("dead") ?? "violet";

const DEBUG = Boolean(params.get("debug"));

const EMPTY = 0;
const ALIVE = 1;
const DEAD = 2;

const width = Math.round(window.innerWidth / SCALE_RATIO);
const height = Math.round(window.innerHeight / SCALE_RATIO);

const outputCanvas = document.querySelector("canvas");
const bufferCanvas = new OffscreenCanvas(width, height); // Canvas updated, never displayed

const outputCanvasCtx = outputCanvas.getContext("2d", { alpha: false });
const bufferCanvasCtx = bufferCanvas.getContext("2d", { alpha: false });

// UInt8Array for performance
const cells = new Uint8Array(width * height);
const nextCells = new Uint8Array(width * height); // cells updated for next loop
const bufferCells = new Uint8Array(width * height); // copy of canvas status, to only update cells which have changed

const getCell = (x, y, array = cells) => {
  if (x < 0 || y < 0 || x > width || y > height) return EMPTY; // handle edge
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
        setCell(x, y, DEAD, nextCells); // kill cell if under or over populated
      } else if (n === 3) {
        setCell(x, y, ALIVE, nextCells); // birth
      } else if (status === DEAD) {
        setCell(x, y, EMPTY, nextCells); // clean dead cells after a loop
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
  const beforeRender = DEBUG ? Date.now() : 0;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const status = getCell(x, y);
      const color = getColor(status);
      if (getCell(x, y, bufferCells) !== status) {
        bufferCanvasCtx.fillStyle = color;
        bufferCanvasCtx.fillRect(x, y, 1, 1);
        setCell(x, y, status, bufferCells);
      }
    }
  }
  if (DEBUG) {
    console.log("rendering time", Date.now() - beforeRender); // to debug rendering time
  }
  const beforeDraw = DEBUG ? Date.now() : 0;
  outputCanvasCtx.drawImage(bufferCanvas, 0, 0);
  if (DEBUG) {
    console.log("drawing time", Date.now() - beforeDraw); // to debug drawing time
  }
};

const init = () => {
  // set canvas width/height
  outputCanvas.width = window.innerWidth;
  outputCanvas.height = window.innerHeight;

  // initialize cells in arrays
  cells.fill(EMPTY);
  bufferCells.fill(EMPTY);

  // init cells randomly
  randomizeCells();

  // initialize buffer canvas
  bufferCanvasCtx.fillStyle = DEFAULT_COLOR;
  bufferCanvasCtx.fillRect(0, 0, width, height);
  outputCanvasCtx.scale(SCALE_RATIO, SCALE_RATIO);
};

const doLoop = () => {
  updateCells(); // now, nextCells contains next frame status
  cells.set(nextCells); // copy nextCells into cells
  draw(); // render to visible canvas
  if (LOOP === 0) {
    requestAnimationFrame(doLoop); // use requestAnimationFrame by default (ideal for perfs and « sleeps » if tab not visible)
  } else {
    setTimeout(doLoop, LOOP); // good old setTimeout if you wan’t to see what’s happening
  }
};

const start = () => doLoop();

init();
start();
