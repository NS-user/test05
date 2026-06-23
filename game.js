/* =========================================================
   算術勇者クエスト ～AIの塔～
   風来のシレン風 数学ローグライク (Vanilla JS + Canvas)
   ・1画面=1フロア。階段(▲)で上の階へ
   ・敵にぶつかると数学バトル。5階ごとにボス
   ========================================================= */

'use strict';

/* ---------- ドット絵スプライト描画 ---------- */
function drawSprite(ctx, sprite, palette, x, y, scale) {
  for (let row = 0; row < sprite.length; row++) {
    const line = sprite[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = palette[ch] || '#f0f';
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
function spriteW(spr) { return spr[0].length; }

/* ---------- スプライト定義 ---------- */

// 主人公：AIロボット
const SPR_AI = [
  '......AA......',
  '......BB......',
  '...CCCCCCC....',
  '..CWWWWWWWC...',
  '..CWEEWEEWC...',
  '..CWWWWWWWC...',
  '..CWMMMMMWC...',
  '...CCCCCCC....',
  '..GBBBBBBBG...',
  '.G.BBHHBB.G...',
  '.G.BBBBBB.G...',
  '...BB..BB.....',
  '...BB..BB.....',
  '..KK....KK....',
];
const PAL_AI = { A:'#ff4d4d', B:'#3a6df0', C:'#9fd0ff', W:'#e8f4ff', E:'#00e5ff', M:'#2ec27e', G:'#1b3a9e', H:'#ffe14d', K:'#888' };

// スライム
const SPR_SLIME = [
  '..............','.....SSSS.....','....SSSSSS....','...SSSSSSSS...',
  '..SSSSSSSSSS..','.SSWSSSSWSSS..','.SSWSSSSWSSS..','.SSSSSSSSSSS..',
  '.SSSMMMMSSSS..','SSSSSSSSSSSSSS','SSSSSSSSSSSSSS','.SS.SS.SS.SS..',
];
const PAL_SLIME = { S:'#36c5f0', W:'#ffffff', M:'#0a3a55' };

// こうもり
const SPR_BAT = [
  '..............','W...........W.','WW.........WW.','WWWW.PPP.WWWW.',
  '.WWWPPPPPWWW..','..WWPEPEPWW...','...WPPPPPW....','....PPMPP.....','.....PPP......',
];
const PAL_BAT = { W:'#5a3a8a', P:'#7b4dc0', E:'#ff3b3b', M:'#fff' };

// おおねずみ
const SPR_RAT = [
  '..............','.R..........R.','.RR........RR.','..RRRRRRRRRR..',
  '..RRWRRRRWRR..','..RRRRPPRRRR..','..RRRRRRRRRR..','...RRRRRRRR...','..T..T..T..T..',
];
const PAL_RAT = { R:'#9a7b5a', W:'#1a1a1a', P:'#ff9aa0', T:'#6a4a2a' };

// ゴースト
const SPR_GHOST = [
  '....GGGG....','..GGGGGGGG..','.GGGGGGGGGG.','.GGWWGGWWGG.',
  '.GGWWGGWWGG.','.GGGGGGGGGG.','.GGGGGGGGGG.','.GGGGGGGGGG.','.G.GG.GG.GG.',
];
const PAL_GHOST = { G:'#b6b6ec', W:'#23234a' };

// メカむし
const SPR_MECH = [
  '..M......M..','..MM....MM..','...MMMMMM...','..MEMMMMEM..',
  '..MMMMMMMM..','.M.MMMMMM.M.','M..MMMMMM..M','...M....M...',
];
const PAL_MECH = { M:'#6a6a7a', E:'#00e5ff' };

// ゴーレム
const SPR_GOLEM = [
  '..GGGGGGGG....','.GRRRRRRRRG...','.GRREREERRG...','.GRRRRRRRRG...',
  '.GRRMMMMRRG...','GGRRRRRRRRGG..','GRRRRRRRRRRG..','GRRGRRRRGRRG..',
  'GRRRRRRRRRRG..','.GRRG..GRRG...','.GGGG..GGGG...',
];
const PAL_GOLEM = { G:'#5a4a30', R:'#8a7350', E:'#ffcf3b', M:'#2a1f10' };

// よろいへい
const SPR_ARMOR = [
  '....AAAA....','...A0000A...','...AHHHHA...','....AAAA....',
  '...AAAAAA...','..A AAAA A..','..A AAAA A..','....AA AA...','...AA....AA.',
];
const PAL_ARMOR = { A:'#8a8aa0', H:'#ff3b3b', '0':'#33334a' };

// ドラゴン
const SPR_DRAGON = [
  '.D........D...','.DD......DD...','.DDD.NN.DDD...','..DDDNNNDD....',
  '...DNEPENNN...','...DNNNNNND...','..DDNNFFNNDD..','.DD.NNNNNN.DD.',
  'D...NNNNNN...D','....NN..NN....','...NN....NN...',
];
const PAL_DRAGON = { D:'#1f7a3a', N:'#2ec27e', E:'#ffe14d', P:'#000', F:'#fff' };

/* ----- ボススプライト ----- */
// キングスライム
const SPR_KING = [
  '...Y.Y.Y....','...YYYYY....','..SSSSSSS...','.SSSSSSSSS..',
  'SSSWSSSWSSS.','SSSWSSSWSSS.','SSSSSSSSSSS.','SSSMMMMMSSS.',
  'SSSSSSSSSSS.','.SSSSSSSSS..',
];
const PAL_KING = { Y:'#ffe14d', S:'#3aa0e0', W:'#fff', M:'#0a3a55' };

// がいこつナイト
const SPR_SKEL = [
  '...KKKKK....','..KKKKKKK...','..KEKKKEK...','..KKKKKKK...',
  '..KKMMMKK...','...KKKKK....','.SK.KKK.KS..','SK..KKK..KS.','.K.......K..',
];
const PAL_SKEL = { K:'#e8e0c8', E:'#ff3b3b', M:'#444', S:'#9aa' };

// まおう
const SPR_DEMON = [
  '.D.......D..','.DD.....DD..','..DDDDDDD...','.DDPDDDPDD..',
  '..DDDDDDD...','..DDFFFDD...','.WW.DDD.WW..','WW..DDD..WW.','....DDD.....',
];
const PAL_DEMON = { D:'#7a1f7a', P:'#ffe14d', F:'#fff', W:'#4a0f4a' };

/* ---------- 敵ロスター ---------- */
// minF: その階以上で出現
const NORMAL_ENEMIES = [
  { name:'スライム',   spr:SPR_SLIME, pal:PAL_SLIME, minF:1 },
  { name:'こうもり',   spr:SPR_BAT,   pal:PAL_BAT,   minF:1 },
  { name:'おおねずみ', spr:SPR_RAT,   pal:PAL_RAT,   minF:3 },
  { name:'ゴースト',   spr:SPR_GHOST, pal:PAL_GHOST, minF:5 },
  { name:'メカむし',   spr:SPR_MECH,  pal:PAL_MECH,  minF:7 },
  { name:'ゴーレム',   spr:SPR_GOLEM, pal:PAL_GOLEM, minF:9 },
  { name:'よろいへい', spr:SPR_ARMOR, pal:PAL_ARMOR, minF:12 },
  { name:'ドラゴン',   spr:SPR_DRAGON,pal:PAL_DRAGON,minF:15 },
];
const BOSSES = [
  { name:'キングスライム', spr:SPR_KING,   pal:PAL_KING },
  { name:'がいこつナイト', spr:SPR_SKEL,   pal:PAL_SKEL },
  { name:'じごくドラゴン', spr:SPR_DRAGON, pal:PAL_DRAGON },
  { name:'まおう',         spr:SPR_DEMON,  pal:PAL_DEMON },
];

/* ---------- 数学問題（難易度 lv に応じて難化） ---------- */
function makeQuiz(level) {
  let q, a;
  const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  if (level <= 2) {
    const x = r(1, 9 + level * 2), y = r(1, 9 + level * 2);
    if (Math.random() < 0.5) { q = `${x} + ${y}`; a = x + y; }
    else { const [b, s] = x >= y ? [x, y] : [y, x]; q = `${b} − ${s}`; a = b - s; }
  } else if (level <= 4) {
    const x = r(2, 9), y = r(2, 9); q = `${x} × ${y}`; a = x * y;
  } else if (level <= 6) {
    if (Math.random() < 0.5) { const y = r(2, 9), a2 = r(2, 9); q = `${y * a2} ÷ ${y}`; a = a2; }
    else { const x = r(2, 12), y = r(2, 9), z = r(1, 9); q = `${x} × ${y} + ${z}`; a = x * y + z; }
  } else if (level <= 9) {
    if (Math.random() < 0.5) { const x = r(2, 12), b = r(1, 20); q = `x + ${b} = ${x + b} のとき x = ?`; a = x; }
    else { const base = r(2, 9); q = `${base}²`; a = base * base; }
  } else {
    if (Math.random() < 0.5) { const x = r(3, 12), m = r(2, 6), b = r(1, 15); q = `${m}x + ${b} = ${m * x + b} のとき x = ?`; a = x; }
    else { const x = r(11, 19), y = r(11, 19); q = `${x} × ${y}`; a = x * y; }
  }
  return { q, a };
}

/* ---------- ゲーム状態 ---------- */
const COLS = 15, ROWS = 10, TILE = 32;
const hero = { lv:1, hp:20, maxhp:20, exp:0, next:10, x:7, y:8, combo:0 };
let floor = 1;
let best = Number(localStorage.getItem('aiq_best') || 1);
let map = [];
let enemies = [];
let items = [];
let stairs = null;

let currentEntity = null;   // 戦闘中の敵エンティティ
let currentEnemy = null;    // その定義
let hitsLeft = 0;           // 残り必要正解数
let isBossBattle = false;
let currentQuiz = null;
let quizTimer = null;
let timeLeft = 0;
let busy = false;           // 演出中の入力ロック

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);
const screens = {
  title: $('title-screen'),
  dungeon: $('dungeon-screen'),
  battle: $('battle-screen'),
  gameover: $('gameover-screen'),
};
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

/* ---------- フロア生成 ---------- */
function inBounds(x, y) { return x >= 0 && y >= 0 && x < COLS && y < ROWS; }

function reachable(sx, sy, tx, ty) {
  const seen = new Set([sx + ',' + sy]);
  const q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) return true;
    for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nx = x + dx, ny = y + dy;
      if (inBounds(nx, ny) && map[ny][nx] === 0 && !seen.has(nx + ',' + ny)) {
        seen.add(nx + ',' + ny); q.push([nx, ny]);
      }
    }
  }
  return false;
}

function occupied(x, y) {
  return enemies.some(e => e.x === x && e.y === y) || items.some(i => i.x === x && i.y === y);
}

function pickEnemyDef(f) {
  const cands = NORMAL_ENEMIES.filter(e => e.minF <= f);
  if (Math.random() < 0.45) return cands[cands.length - 1];        // 最新（強め）
  return cands[Math.floor(Math.random() * cands.length)];
}

function placeEntities(count, type, f) {
  let placed = 0, guard = 0;
  while (placed < count && guard++ < 300) {
    const x = 1 + Math.floor(Math.random() * (COLS - 2));
    const y = 1 + Math.floor(Math.random() * (ROWS - 2));
    if (map[y][x] !== 0) continue;
    if (x === hero.x && y === hero.y) continue;
    if (stairs && x === stairs.x && y === stairs.y) continue;
    if (Math.abs(x - hero.x) + Math.abs(y - hero.y) < 2) continue;
    if (occupied(x, y)) continue;
    if (!reachable(hero.x, hero.y, x, y)) continue;
    if (type === 'enemy') {
      const def = pickEnemyDef(f);
      const req = 1 + (f >= 8 ? 1 : 0) + (f >= 16 ? 1 : 0);
      enemies.push({ x, y, def, hp: req, maxhp: req, isBoss: false, exp: 3 + f });
    } else {
      items.push({ x, y, type: 'potion' });
    }
    placed++;
  }
}

function genFloor(f) {
  enemies = []; items = []; stairs = null;
  const isBoss = f % 5 === 0;
  // 初期化（外周=壁）
  map = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push((r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1) ? 1 : 0);
    map.push(row);
  }
  hero.x = 7; hero.y = ROWS - 2;

  if (isBoss) {
    // ボス部屋：開けたアリーナ。倒すまで階段なし
    const idx = ((f / 5) - 1) % BOSSES.length;
    const def = BOSSES[idx];
    const req = 2 + Math.ceil(f / 5);
    enemies.push({ x: 7, y: 3, def, hp: req, maxhp: req, isBoss: true, exp: 20 + f * 3 });
    // 回復をひとつ置く
    placeEntities(1, 'item', f);
    return;
  }

  // 通常フロア：壁を散らして、階段まで到達可能になるまでやり直す
  let tries = 0;
  do {
    for (let r = 1; r < ROWS - 1; r++)
      for (let c = 1; c < COLS - 1; c++)
        map[r][c] = Math.random() < 0.14 ? 1 : 0;
    stairs = { x: 1 + Math.floor(Math.random() * (COLS - 2)), y: 1 };
    map[stairs.y][stairs.x] = 0;
    map[hero.y][hero.x] = 0;
    map[hero.y - 1][hero.x] = 0; // 入口前を確保
  } while (!reachable(hero.x, hero.y, stairs.x, stairs.y) && ++tries < 50);
  if (tries >= 50) { // 念のため全開放
    for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS - 1; c++) map[r][c] = 0;
  }

  placeEntities(Math.min(2 + Math.floor(f / 2), 5), 'enemy', f);
  const pots = (Math.random() < 0.6 ? 1 : 0) + (f % 3 === 0 ? 1 : 0);
  placeEntities(pots, 'item', f);
}

/* ---------- ダンジョン描画 ---------- */
const dCv = $('dungeon-canvas');
const dctx = dCv.getContext('2d');
dctx.imageSmoothingEnabled = false;

const ZONES = [
  { f:'#3a3050', w:'#5a4a7a' }, // 紫
  { f:'#2a3a30', w:'#3f5a48' }, // 緑
  { f:'#3a2a2a', w:'#5a3a3a' }, // 赤茶
  { f:'#23304a', w:'#34507a' }, // 青
  { f:'#3a3320', w:'#5a4f30' }, // 黄土
];

function drawDungeon() {
  const zone = ZONES[Math.floor((floor - 1) / 5) % ZONES.length];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const px = c * TILE, py = r * TILE;
      if (map[r][c] === 1) {
        dctx.fillStyle = zone.w;
        dctx.fillRect(px, py, TILE, TILE);
        dctx.fillStyle = 'rgba(0,0,0,.25)';
        dctx.fillRect(px, py + TILE - 5, TILE, 5);
        dctx.fillRect(px + TILE - 5, py, 5, TILE);
      } else {
        dctx.fillStyle = ((r + c) % 2 === 0) ? zone.f : shade(zone.f, -10);
        dctx.fillRect(px, py, TILE, TILE);
      }
    }
  }
  // 階段
  if (stairs) {
    const px = stairs.x * TILE, py = stairs.y * TILE;
    dctx.fillStyle = '#000'; dctx.fillRect(px + 4, py + 4, 24, 24);
    dctx.fillStyle = '#ffe14d';
    for (let i = 0; i < 4; i++) dctx.fillRect(px + 7 + i * 2, py + 22 - i * 5, 18 - i * 4, 4);
    dctx.fillStyle = '#fff';
    dctx.fillRect(px + 14, py + 6, 4, 4); dctx.fillRect(px + 12, py + 8, 8, 2);
  }
  // アイテム（ポーション）
  for (const it of items) {
    const px = it.x * TILE, py = it.y * TILE;
    dctx.fillStyle = '#fff'; dctx.fillRect(px + 13, py + 6, 6, 4);
    dctx.fillStyle = '#e0e0e0'; dctx.fillRect(px + 11, py + 10, 10, 16);
    dctx.fillStyle = '#ff5b6e'; dctx.fillRect(px + 12, py + 16, 8, 9);
  }
  // 敵
  for (const e of enemies) {
    const sc = e.isBoss ? 2 : 2;
    const w = spriteW(e.def.spr) * sc;
    drawSprite(dctx, e.def.spr, e.def.pal, e.x * TILE + (TILE - w) / 2, e.y * TILE + 3, sc);
  }
  // 主人公
  drawSprite(dctx, SPR_AI, PAL_AI, hero.x * TILE + 2, hero.y * TILE + 2, 2);
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}

/* ---------- トースト ---------- */
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}

/* ---------- HUD ---------- */
function updateHUD() {
  $('hud-floor').textContent = floor;
  $('hud-lv').textContent = hero.lv;
  $('hud-hp').textContent = hero.hp;
  $('hud-maxhp').textContent = hero.maxhp;
  $('hud-exp').textContent = hero.exp;
  $('hud-combo').textContent = hero.combo;
  $('hud-best').textContent = best;
}

/* ---------- 移動 ---------- */
function tryMove(dx, dy) {
  if (busy) return;
  const nx = hero.x + dx, ny = hero.y + dy;
  if (!inBounds(nx, ny) || map[ny][nx] === 1) return;
  const e = enemies.find(en => en.x === nx && en.y === ny);
  if (e) { startBattle(e); return; }
  hero.x = nx; hero.y = ny;
  // アイテム
  const ii = items.findIndex(i => i.x === nx && i.y === ny);
  if (ii >= 0) {
    const heal = Math.min(hero.maxhp - hero.hp, 10 + Math.floor(hero.maxhp * 0.25));
    hero.hp += heal; items.splice(ii, 1);
    toast(`🧪 ポーション！ HP +${heal}`); updateHUD();
  }
  // 階段
  if (stairs && nx === stairs.x && ny === stairs.y) { nextFloor(); return; }
  drawDungeon();
}

function nextFloor() {
  floor++;
  if (floor > best) { best = floor; localStorage.setItem('aiq_best', best); }
  genFloor(floor);
  updateHUD();
  drawDungeon();
  toast(floor % 5 === 0 ? `▲ ${floor}F … ボスのけはい！` : `▲ ${floor}F に のぼった！`);
}

/* ---------- バトル ---------- */
const bCv = $('battle-canvas');
const bctx = bCv.getContext('2d');
bctx.imageSmoothingEnabled = false;

function quizLevel() {
  let lv = 1 + Math.floor((floor - 1) / 2);
  if (isBossBattle) lv += 1;
  return lv;
}

function drawBattleScene() {
  const g = bctx.createLinearGradient(0, 0, 0, 200);
  if (isBossBattle) { g.addColorStop(0, '#3a0a1a'); g.addColorStop(1, '#06060f'); }
  else { g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#06060f'); }
  bctx.fillStyle = g; bctx.fillRect(0, 0, 480, 200);
  bctx.fillStyle = '#241a40'; bctx.fillRect(0, 150, 480, 50);
  bctx.fillStyle = '#2e2250';
  for (let i = 0; i < 480; i += 40) bctx.fillRect(i, 150, 20, 4);
  const scale = isBossBattle ? 9 : 6;
  const w = spriteW(currentEnemy.spr) * scale;
  drawSprite(bctx, currentEnemy.spr, currentEnemy.pal, 240 - w / 2, isBossBattle ? 10 : 30, scale);
}

function startBattle(entity) {
  currentEntity = entity;
  currentEnemy = entity.def;
  hitsLeft = entity.hp;
  isBossBattle = entity.isBoss;
  showScreen('battle');
  drawBattleScene();
  $('b-enemy-name').textContent = (isBossBattle ? '👑 ' : '') + currentEnemy.name;
  $('b-lv').textContent = hero.lv;
  updateBattleBars();
  setMessage(isBossBattle ? `ボス ${currentEnemy.name} が たちはだかる！` : `${currentEnemy.name} が あらわれた！`);
  busy = true;
  setTimeout(nextQuestion, 950);
}

function updateBattleBars() {
  $('enemy-hp-fill').style.width = (hitsLeft / currentEntity.maxhp * 100) + '%';
  $('hero-hp-fill').style.width = (hero.hp / hero.maxhp * 100) + '%';
  $('b-hp').textContent = hero.hp;
  $('b-maxhp').textContent = hero.maxhp;
  $('b-combo').textContent = hero.combo;
}

function setMessage(msg) { $('battle-message').textContent = msg; }

function nextQuestion() {
  currentQuiz = makeQuiz(quizLevel());
  $('quiz-question').textContent = currentQuiz.q + ' = ?';
  $('quiz-area').classList.add('active');
  const input = $('quiz-answer');
  input.value = ''; input.disabled = false;
  $('quiz-submit').disabled = false;
  if (!isTouch) input.focus();
  setMessage(hitsLeft > 1 ? `あと ${hitsLeft}回 せいかいで たおせる！` : '問題を といて こうげき！');
  busy = false;
  startQuizTimer();
}

function startQuizTimer() {
  clearInterval(quizTimer);
  timeLeft = 12 + (isBossBattle ? 8 : Math.floor(floor / 3) * 2);
  const total = timeLeft;
  const bar = $('quiz-timer');
  bar.style.setProperty('--t', '100%');
  quizTimer = setInterval(() => {
    timeLeft -= 0.1;
    bar.style.setProperty('--t', Math.max(0, timeLeft / total * 100) + '%');
    if (timeLeft <= 0) { clearInterval(quizTimer); onWrong(true); }
  }, 100);
}

function submitAnswer() {
  if (!currentQuiz || busy) return;
  const val = $('quiz-answer').value.trim();
  if (val === '') return;
  clearInterval(quizTimer);
  busy = true;
  $('quiz-answer').disabled = true; $('quiz-submit').disabled = true;
  if (Number(val) === currentQuiz.a) onCorrect();
  else onWrong(false);
}

function onCorrect() {
  hitsLeft--;
  hero.combo++;
  $('quiz-area').classList.remove('active');
  updateBattleBars();
  bCv.classList.remove('shake'); void bCv.offsetWidth; bCv.classList.add('shake');
  if (hitsLeft <= 0) {
    setMessage(`せいかい！ ${currentEnemy.name}に とどめ！`);
    setTimeout(winBattle, 750);
  } else {
    setMessage(`せいかい！ 🔥コンボ x${hero.combo}！`);
    updateHUD();
    setTimeout(nextQuestion, 800);
  }
}

function onWrong(timeout) {
  const dmg = 3 + Math.floor(floor / 2) + (isBossBattle ? 3 : 0) + Math.floor(Math.random() * 3);
  hero.hp = Math.max(0, hero.hp - dmg);
  hero.combo = 0;
  $('quiz-area').classList.remove('active');
  updateBattleBars(); updateHUD();
  setMessage((timeout ? 'じかんぎれ！ ' : 'ざんねん！ ') + `${dmg}の ダメージ…（こたえは ${currentQuiz.a}）`);
  screens.battle.classList.remove('flash'); void screens.battle.offsetWidth; screens.battle.classList.add('flash');
  if (hero.hp <= 0) setTimeout(gameOver, 1000);
  else setTimeout(nextQuestion, 1200);
}

function winBattle() {
  $('quiz-area').classList.remove('active');
  enemies = enemies.filter(e => e !== currentEntity);
  const gain = currentEntity.exp + hero.combo;
  hero.exp += gain;
  setMessage(`${currentEnemy.name}を たおした！ EXP +${gain}`);

  let leveled = false;
  while (hero.exp >= hero.next) {
    hero.exp -= hero.next; hero.lv++; hero.maxhp += 6; hero.hp = hero.maxhp;
    hero.next = Math.floor(hero.next * 1.5); leveled = true;
  }

  const wasBoss = isBossBattle;
  if (wasBoss) { stairs = { x: 7, y: 1 }; map[1][7] = 0; }

  updateHUD();
  setTimeout(() => {
    if (leveled) setMessage(`レベルアップ！ Lv${hero.lv}！ HP全回復！`);
    else if (wasBoss) setMessage('ボスげきは！ 上への かいだんが あらわれた！');
    else { hero.hp = Math.min(hero.maxhp, hero.hp + 2); updateHUD(); }
    setTimeout(endBattle, leveled || wasBoss ? 1500 : 900);
  }, 1100);
}

function endBattle() {
  currentQuiz = null; currentEntity = null;
  busy = false;
  showScreen('dungeon');
  updateHUD();
  drawDungeon();
}

/* ---------- ゲームオーバー ---------- */
function gameOver() {
  showScreen('gameover');
  $('gameover-text').textContent = `AIは ${floor}F で ちからつきた…  （最高到達 ${best}F / Lv${hero.lv}）`;
}

/* ---------- リセット / 開始 ---------- */
function resetGame() {
  floor = 1;
  hero.lv = 1; hero.hp = 20; hero.maxhp = 20; hero.exp = 0; hero.next = 10; hero.combo = 0;
  busy = false;
  genFloor(1);
  updateHUD();
}
function startGame() {
  resetGame();
  showScreen('dungeon');
  drawDungeon();
  toast('▲ 1F  とうの ぼうけん スタート！');
}

/* ---------- 入力 ---------- */
const DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
document.addEventListener('keydown', e => {
  if (screens.dungeon.classList.contains('active')) {
    const m = {
      ArrowUp:[0,-1], w:[0,-1], W:[0,-1], ArrowDown:[0,1], s:[0,1], S:[0,1],
      ArrowLeft:[-1,0], a:[-1,0], A:[-1,0], ArrowRight:[1,0], d:[1,0], D:[1,0],
    };
    if (m[e.key]) { e.preventDefault(); tryMove(m[e.key][0], m[e.key][1]); }
  }
  if (screens.battle.classList.contains('active') && e.key === 'Enter') { e.preventDefault(); submitAnswer(); }
  if (screens.title.classList.contains('active') && e.key === 'Enter') startGame();
});

// 十字キー
const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
$('dpad').querySelectorAll('.dbtn').forEach(btn => {
  const handler = e => {
    e.preventDefault();
    if (!screens.dungeon.classList.contains('active')) return;
    const d = DIRS[btn.dataset.dir];
    if (d) tryMove(d[0], d[1]);
  };
  btn.addEventListener('touchstart', handler, { passive: false });
  btn.addEventListener('click', handler);
});

// 数字パッド
if (isTouch) $('quiz-answer').readOnly = true;
$('keypad').querySelectorAll('.key').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const input = $('quiz-answer');
    if (input.disabled) return;
    const k = btn.dataset.k;
    if (k === 'del') input.value = input.value.slice(0, -1);
    else if (k === 'clear') input.value = '';
    else if (input.value.length < 7) input.value += k;
  });
});

$('quiz-submit').addEventListener('click', submitAnswer);
$('quiz-answer').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); } });
$('start-btn').addEventListener('click', startGame);
$('retry-btn').addEventListener('click', startGame);

// タイトルのAI
(function () {
  const tc = $('title-canvas'); const tctx = tc.getContext('2d');
  tctx.imageSmoothingEnabled = false;
  drawSprite(tctx, SPR_AI, PAL_AI, 5, 5, 4);
})();

updateHUD();
