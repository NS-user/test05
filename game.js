/* =========================================================
   算術勇者クエスト ～AIの冒険～
   ドラクエ風 数学RPG  (Vanilla JS + Canvas)
   ========================================================= */

'use strict';

/* ---------- ドット絵スプライト描画 ----------
   '.' = 透明。それ以外の文字をパレットの色で塗る。 */
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

/* ---------- スプライト定義（16x16ドット） ---------- */

// 主人公：AIロボット（青ボディ・光る目・アンテナ）
const SPR_AI = [
  '......AA......',
  '......BB......',
  '...CCCCCCC....',
  '..CWWWWWWWC...',
  '..CWEEWEEWC...',  // 目
  '..CWWWWWWWC...',
  '..CWMMMMMWC...',  // 口（回路）
  '...CCCCCCC....',
  '..GBBBBBBBG...',  // 胴体
  '.G.BBHHBB.G...',  // 胸の発光
  '.G.BBBBBB.G...',
  '...BB..BB.....',
  '...BB..BB.....',
  '..KK....KK....',
];
const PAL_AI = {
  A: '#ff4d4d', // アンテナ先端
  B: '#3a6df0', // ボディ青
  C: '#9fd0ff', // フレーム
  W: '#e8f4ff', // 顔パネル
  E: '#00e5ff', // 目（発光）
  M: '#2ec27e', // 口の回路
  G: '#1b3a9e', // 肩
  H: '#ffe14d', // 胸コア
  K: '#888',    // 足
};

// スライム
const SPR_SLIME = [
  '..............',
  '.....SSSS.....',
  '....SSSSSS....',
  '...SSSSSSSS...',
  '..SSSSSSSSSS..',
  '.SSWSSSSWSSS..',  // 目
  '.SSWSSSSWSSS..',
  '.SSSSSSSSSSS..',
  '.SSSMMMMSSSS..',  // 口
  'SSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSS',
  '.SS.SS.SS.SS..',
];
const PAL_SLIME = { S: '#36c5f0', W: '#ffffff', M: '#0a3a55' };

// こうもり
const SPR_BAT = [
  '..............',
  'W...........W.',
  'WW.........WW.',
  'WWWW.PPP.WWWW.',
  '.WWWPPPPPWWW..',
  '..WWPEPEPWW...',  // 目
  '...WPPPPPW....',
  '....PPMPP.....',  // 牙
  '.....PPP......',
];
const PAL_BAT = { W: '#5a3a8a', P: '#7b4dc0', E: '#ff3b3b', M: '#fff' };

// ゴーレム（岩）
const SPR_GOLEM = [
  '..GGGGGGGG....',
  '.GRRRRRRRRG...',
  '.GRREREERRG...',  // 目
  '.GRRRRRRRRG...',
  '.GRRMMMMRRG...',  // 口
  'GGRRRRRRRRGG..',
  'GRRRRRRRRRRG..',
  'GRRGRRRRGRRG..',
  'GRRRRRRRRRRG..',
  '.GRRG..GRRG...',
  '.GGGG..GGGG...',
];
const PAL_GOLEM = { G: '#5a4a30', R: '#8a7350', E: '#ffcf3b', M: '#2a1f10' };

// ドラゴン（ボス）
const SPR_DRAGON = [
  '.D........D...',
  '.DD......DD...',
  '.DDD.NN.DDD...',
  '..DDDNNNDD....',
  '...DNEPENNN...',  // 目
  '...DNNNNNND...',
  '..DDNNFFNNDD..',  // 牙
  '.DD.NNNNNN.DD.',
  'D...NNNNNN...D',
  '....NN..NN....',
  '...NN....NN...',
];
const PAL_DRAGON = { D: '#1f7a3a', N: '#2ec27e', E: '#ffe14d', P: '#000', F: '#fff' };

const ENEMIES = [
  { name: 'スライム',   spr: SPR_SLIME,  pal: PAL_SLIME,  hp: 1, exp: 3,  tier: 0 },
  { name: 'こうもり',   spr: SPR_BAT,    pal: PAL_BAT,    hp: 1, exp: 5,  tier: 1 },
  { name: 'ゴーレム',   spr: SPR_GOLEM,  pal: PAL_GOLEM,  hp: 2, exp: 9,  tier: 2 },
  { name: 'ドラゴン',   spr: SPR_DRAGON, pal: PAL_DRAGON, hp: 3, exp: 18, tier: 3 },
];

/* ---------- ゲーム状態 ---------- */
const hero = {
  lv: 1, hp: 20, maxhp: 20, exp: 0, next: 10,
  x: 5, y: 4, // フィールド上のタイル座標
};

let currentEnemy = null;
let enemyHpLeft = 0;
let currentQuiz = null;
let quizTimer = null;
let timeLeft = 0;
let stepsSinceBattle = 0;

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);
const screens = {
  title: $('title-screen'),
  field: $('field-screen'),
  battle: $('battle-screen'),
  gameover: $('gameover-screen'),
};
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

/* ---------- フィールドマップ ----------
   0=草地, 1=濃い草(エンカウント), 2=木, 3=水, 4=道, 5=城 */
const MAP = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,0,0,4,4,4,4,4,1,1,0,0,3,3,2],
  [2,0,2,4,0,0,0,4,1,1,1,0,3,3,2],
  [2,1,1,4,0,5,0,4,4,1,1,0,0,0,2],
  [2,1,1,4,4,4,4,4,1,1,1,0,2,0,2],
  [2,0,0,0,0,1,1,1,1,1,0,0,2,2,2],
  [2,3,3,0,0,1,1,1,1,0,0,4,4,4,2],
  [2,3,3,0,0,0,1,1,0,0,0,4,0,0,2],
  [2,0,0,0,2,0,0,0,0,2,0,4,0,0,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];
const TILE = 32;
const TILE_COLORS = {
  0: ['#3a8a3a', '#2e7a2e'], // 草地
  1: ['#2a6a2a', '#1f561f'], // 濃い草
  3: ['#2a5ad0', '#1f47b0'], // 水
  4: ['#c2a86a', '#b09858'], // 道
};

const fieldCv = $('field-canvas');
const fctx = fieldCv.getContext('2d');
fctx.imageSmoothingEnabled = false;

function drawField() {
  for (let r = 0; r < MAP.length; r++) {
    for (let c = 0; c < MAP[r].length; c++) {
      const t = MAP[r][c];
      const px = c * TILE, py = r * TILE;
      // 下地
      const base = TILE_COLORS[t] || TILE_COLORS[0];
      // 市松模様で立体感
      fctx.fillStyle = ((r + c) % 2 === 0) ? base[0] : base[1];
      fctx.fillRect(px, py, TILE, TILE);

      if (t === 1) { // 濃い草：草の房
        fctx.fillStyle = '#1a4a1a';
        for (let i = 0; i < 4; i++) {
          fctx.fillRect(px + 4 + i * 7, py + 18 + (i % 2) * 4, 3, 8);
        }
      } else if (t === 2) { // 木
        fctx.fillStyle = '#5a3a1a'; fctx.fillRect(px + 13, py + 18, 6, 12);
        fctx.fillStyle = '#1f6a1f'; fctx.fillRect(px + 6, py + 4, 20, 18);
        fctx.fillStyle = '#2e8a2e'; fctx.fillRect(px + 9, py + 6, 14, 12);
      } else if (t === 3) { // 水のさざ波
        fctx.fillStyle = 'rgba(255,255,255,.25)';
        fctx.fillRect(px + 5, py + 10, 8, 2);
        fctx.fillRect(px + 18, py + 20, 8, 2);
      } else if (t === 5) { // 城
        fctx.fillStyle = '#9aa0b0'; fctx.fillRect(px + 4, py + 8, 24, 22);
        fctx.fillStyle = '#7a8090'; fctx.fillRect(px + 4, py + 4, 6, 6);
        fctx.fillRect(px + 14, py + 2, 4, 6); fctx.fillRect(px + 22, py + 4, 6, 6);
        fctx.fillStyle = '#3a2a4a'; fctx.fillRect(px + 13, py + 18, 6, 12);
      }
    }
  }
  // 主人公
  drawSprite(fctx, SPR_AI, PAL_AI, hero.x * TILE + 5, hero.y * TILE + 2, 2);
}

function isWalkable(c, r) {
  if (r < 0 || r >= MAP.length || c < 0 || c >= MAP[0].length) return false;
  const t = MAP[r][c];
  return t !== 2 && t !== 3; // 木と水は通れない
}

function moveHero(dx, dy) {
  const nc = hero.x + dx, nr = hero.y + dy;
  if (!isWalkable(nc, nr)) return;
  hero.x = nc; hero.y = nr;
  drawField();
  // 濃い草でエンカウント判定
  if (MAP[nr][nc] === 1) {
    stepsSinceBattle++;
    const chance = Math.min(0.35 + stepsSinceBattle * 0.08, 0.85);
    if (Math.random() < chance) {
      stepsSinceBattle = 0;
      startBattle();
    }
  }
}

/* ---------- HUD ---------- */
function updateHUD() {
  $('hud-lv').textContent = hero.lv;
  $('hud-hp').textContent = hero.hp;
  $('hud-maxhp').textContent = hero.maxhp;
  $('hud-exp').textContent = hero.exp;
}

/* ---------- 数学問題生成（レベルに応じて難化） ---------- */
function makeQuiz(level) {
  let q, a;
  const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (level <= 2) {                       // たし算・ひき算
    const x = r(1, 9 + level * 2), y = r(1, 9 + level * 2);
    if (Math.random() < 0.5) { q = `${x} + ${y}`; a = x + y; }
    else { const [big, sm] = x >= y ? [x, y] : [y, x]; q = `${big} − ${sm}`; a = big - sm; }
  } else if (level <= 4) {                 // かけ算
    const x = r(2, 9), y = r(2, 9);
    q = `${x} × ${y}`; a = x * y;
  } else if (level <= 6) {                 // わり算（割り切れる）/ 複合
    if (Math.random() < 0.5) {
      const y = r(2, 9), a2 = r(2, 9); q = `${y * a2} ÷ ${y}`; a = a2;
    } else {
      const x = r(2, 12), y = r(2, 9), z = r(1, 9);
      q = `${x} × ${y} + ${z}`; a = x * y + z;
    }
  } else if (level <= 9) {                 // かんたんな方程式・累乗
    if (Math.random() < 0.5) {
      const x = r(2, 12), b = r(1, 20), res = x + b;
      q = `x + ${b} = ${res} のとき x = ?`; a = x;
    } else {
      const base = r(2, 9); q = `${base}²`; a = base * base;
    }
  } else {                                 // 上級：2乗・連立っぽい
    if (Math.random() < 0.5) {
      const x = r(3, 12), m = r(2, 6), b = r(1, 15);
      q = `${m}x + ${b} = ${m * x + b} のとき x = ?`; a = x;
    } else {
      const x = r(11, 19), y = r(11, 19); q = `${x} × ${y}`; a = x * y;
    }
  }
  return { q, a };
}

/* ---------- バトル ---------- */
const battleCv = $('battle-canvas');
const bctx = battleCv.getContext('2d');
bctx.imageSmoothingEnabled = false;

function pickEnemy() {
  // レベルが上がるほど強い敵が出やすい
  const maxTier = Math.min(Math.floor((hero.lv - 1) / 2), ENEMIES.length - 1);
  const tier = Math.random() < 0.6 ? maxTier : r0(0, maxTier);
  return ENEMIES.find(e => e.tier === tier) || ENEMIES[0];
}
function r0(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function drawBattleScene() {
  // 背景：洞窟風グラデ
  const g = bctx.createLinearGradient(0, 0, 0, 200);
  g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#06060f');
  bctx.fillStyle = g; bctx.fillRect(0, 0, 480, 200);
  // 地面
  bctx.fillStyle = '#241a40'; bctx.fillRect(0, 150, 480, 50);
  bctx.fillStyle = '#2e2250';
  for (let i = 0; i < 480; i += 40) bctx.fillRect(i, 150, 20, 4);

  // 敵（大きく描画）
  const scale = 6;
  const w = currentEnemy.spr[0].length * scale;
  drawSprite(bctx, currentEnemy.spr, currentEnemy.pal,
    240 - w / 2, 30, scale);
}

function startBattle() {
  currentEnemy = pickEnemy();
  enemyHpLeft = currentEnemy.hp;
  showScreen('battle');
  drawBattleScene();
  $('b-enemy-name').textContent = currentEnemy.name;
  $('b-lv').textContent = hero.lv;
  $('b-hp').textContent = hero.hp;
  $('b-maxhp').textContent = hero.maxhp;
  updateBattleBars();
  setMessage(`${currentEnemy.name}が あらわれた！`);
  setTimeout(nextQuestion, 900);
}

function updateBattleBars() {
  $('enemy-hp-fill').style.width = (enemyHpLeft / currentEnemy.hp * 100) + '%';
  $('hero-hp-fill').style.width = (hero.hp / hero.maxhp * 100) + '%';
  $('b-hp').textContent = hero.hp;
}

function setMessage(msg) { $('battle-message').textContent = msg; }

function nextQuestion() {
  currentQuiz = makeQuiz(hero.lv);
  $('quiz-question').textContent = currentQuiz.q + ' = ?';
  $('quiz-area').classList.add('active');
  const input = $('quiz-answer');
  input.value = '';
  input.disabled = false;
  $('quiz-submit').disabled = false;
  input.focus();
  setMessage('問題を といて こうげき！');
  startQuizTimer();
}

function startQuizTimer() {
  clearInterval(quizTimer);
  // 難しい敵ほど制限時間は長め
  timeLeft = 8 + currentEnemy.tier * 3;
  const total = timeLeft;
  const bar = $('quiz-timer');
  bar.style.setProperty('--t', '100%');
  quizTimer = setInterval(() => {
    timeLeft -= 0.1;
    bar.style.setProperty('--t', Math.max(0, timeLeft / total * 100) + '%');
    if (timeLeft <= 0) {
      clearInterval(quizTimer);
      onWrong(true);
    }
  }, 100);
}

function submitAnswer() {
  if (!currentQuiz) return;
  const val = $('quiz-answer').value.trim();
  if (val === '') return;
  clearInterval(quizTimer);
  const ans = Number(val);
  if (ans === currentQuiz.a) onCorrect();
  else onWrong(false);
}

function onCorrect() {
  enemyHpLeft--;
  setMessage(`せいかい！ ${currentEnemy.name}に こうげき！`);
  // 敵を揺らす
  battleCv.classList.remove('shake'); void battleCv.offsetWidth;
  battleCv.classList.add('shake');
  updateBattleBars();
  $('quiz-area').classList.remove('active');

  if (enemyHpLeft <= 0) {
    setTimeout(winBattle, 700);
  } else {
    setMessage(`せいかい！ のこり ${enemyHpLeft}回 で たおせる！`);
    setTimeout(nextQuestion, 800);
  }
}

function onWrong(timeout) {
  const dmg = 3 + currentEnemy.tier * 2 + Math.floor(Math.random() * 3);
  hero.hp = Math.max(0, hero.hp - dmg);
  updateBattleBars();
  $('quiz-area').classList.remove('active');
  const correct = currentQuiz.a;
  setMessage(timeout
    ? `じかんぎれ！ ${dmg}の ダメージ…（こたえは ${correct}）`
    : `ざんねん！ ${dmg}の ダメージ…（こたえは ${correct}）`);
  // 画面フラッシュ
  screens.battle.classList.remove('flash'); void screens.battle.offsetWidth;
  screens.battle.classList.add('flash');

  if (hero.hp <= 0) {
    setTimeout(gameOver, 900);
  } else {
    setTimeout(nextQuestion, 1100);
  }
}

function winBattle() {
  $('quiz-area').classList.remove('active');
  hero.exp += currentEnemy.exp;
  setMessage(`${currentEnemy.name}を たおした！ EXP +${currentEnemy.exp}`);

  // レベルアップ判定
  let leveled = false;
  while (hero.exp >= hero.next) {
    hero.exp -= hero.next;
    hero.lv++;
    hero.maxhp += 6;
    hero.hp = hero.maxhp;          // 全回復
    hero.next = Math.floor(hero.next * 1.5);
    leveled = true;
  }
  updateHUD();

  if (leveled) {
    setTimeout(() => {
      setMessage(`レベルが あがった！ Lv${hero.lv}！ HPが かいふくした！`);
      setTimeout(endBattle, 1600);
    }, 1100);
  } else {
    // 少しHP回復のごほうび
    hero.hp = Math.min(hero.maxhp, hero.hp + 2);
    updateHUD();
    setTimeout(endBattle, 1300);
  }
}

function endBattle() {
  currentQuiz = null;
  showScreen('field');
  updateHUD();
  drawField();
}

/* ---------- ゲームオーバー ---------- */
function gameOver() {
  showScreen('gameover');
  $('gameover-text').textContent =
    `AIは ちからつきた…  (Lv${hero.lv} まで せいちょうした)`;
}

function resetGame() {
  hero.lv = 1; hero.hp = 20; hero.maxhp = 20;
  hero.exp = 0; hero.next = 10; hero.x = 5; hero.y = 4;
  stepsSinceBattle = 0;
  updateHUD();
}

/* ---------- 入力 ---------- */
document.addEventListener('keydown', e => {
  // フィールド移動
  if (screens.field.classList.contains('active')) {
    const map = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
    };
    if (map[e.key]) { e.preventDefault(); moveHero(map[e.key][0], map[e.key][1]); }
  }
  // バトルで Enter 送信
  if (screens.battle.classList.contains('active') && e.key === 'Enter') {
    e.preventDefault(); submitAnswer();
  }
  // タイトルで Enter スタート
  if (screens.title.classList.contains('active') && e.key === 'Enter') {
    startGame();
  }
});

$('quiz-submit').addEventListener('click', submitAnswer);
$('quiz-answer').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); }
});

/* ---------- 開始 / タイトル描画 ---------- */
function startGame() {
  resetGame();
  showScreen('field');
  drawField();
  fieldCv.focus();
}

$('start-btn').addEventListener('click', startGame);
$('retry-btn').addEventListener('click', startGame);

// タイトルのAIをドット絵で表示
(function drawTitleHero() {
  const tc = $('title-canvas');
  const tctx = tc.getContext('2d');
  tctx.imageSmoothingEnabled = false;
  drawSprite(tctx, SPR_AI, PAL_AI, 5, 5, 4);
})();

updateHUD();
