/* ---------- 記録の保存（iPhoneアプリ版だけ。Web版では読み込まれない） ----------
 * ゲームは記録（自己ベスト・ランキング・役コレクション・解放状態）を localStorage に書く。
 * iPhone は容量が足りないときなどに WKWebView の localStorage を消すことがあるので、
 * 同じ内容を消えにくいアプリの保存領域（@capacitor/preferences）にも書いておく。
 * ・起動時：localStorage に無い記録だけ Preferences から戻す（ある記録はそちらが新しい）
 *           localStorage の記録は Preferences に写し直す（この仕組みが入る前の記録の引き継ぎも兼ねる）
 * ・記録を書くたび：Preferences にも同じ内容を書く
 * 戻し終わってから main.js を読み込む（main.js は起動直後に記録を読むため）。
 */
(() => {
'use strict';
const P = window.capacitorPreferences && window.capacitorPreferences.Preferences;
const isSave = k => typeof k === 'string' && (k.startsWith('tenraku-') || k.startsWith('ponpon-pai-'));

let started = false;
function startGame() {
  if (started) return; started = true;
  const s = document.createElement('script');
  s.src = 'js/main.js';
  document.body.appendChild(s);
}
if (!P) { startGame(); return; }

const ls = window.localStorage;
const setItem = Storage.prototype.setItem, removeItem = Storage.prototype.removeItem;
Storage.prototype.setItem = function (k, v) {
  setItem.call(this, k, v);
  if (this === ls && isSave(k)) P.set({ key: k, value: String(v) }).catch(() => {});
};
Storage.prototype.removeItem = function (k) {
  removeItem.call(this, k);
  if (this === ls && isSave(k)) P.remove({ key: k }).catch(() => {});
};

async function restore() {
  const { keys } = await P.keys();
  const saved = new Set(keys.filter(isSave));
  for (const k of saved) {
    if (ls.getItem(k) !== null) continue;
    const { value } = await P.get({ key: k });
    if (value !== null) setItem.call(ls, k, value);
  }
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (isSave(k)) await P.set({ key: k, value: ls.getItem(k) });
  }
}
setTimeout(startGame, 3000);   // 保存領域が応答しなくてもゲームは始める
restore().catch(() => {}).then(startGame);
})();
