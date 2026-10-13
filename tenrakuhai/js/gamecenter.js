/* ---------- Game Center（世界ランキング。iPhoneアプリ版だけ。Web版では読み込まれない） ----------
 * iOS 側の部品は ios/App/App/GameCenter.swift。
 * ランキングの ID は App Store Connect の「Game Center」で作ったものと同じにする。
 * ゲーム側からは window.GameCenter.submit(エンドレスか, 点数) と show(エンドレスか) を使う。
 */
(() => {
'use strict';
const cap = window.Capacitor;
if (!cap || !cap.isNativePlatform || !cap.isNativePlatform() || !cap.registerPlugin) return;
const GC = cap.registerPlugin('GameCenter');
const BOARDS = { normal: 'tenrakuhai.score', endless: 'tenrakuhai.endless' };
const board = endless => endless ? BOARDS.endless : BOARDS.normal;
let signedIn = false;

function send(endless, score) {
  score = Math.floor(+score || 0);
  if (score > 0) GC.submitScore({ leaderboardId: board(endless), score }).catch(() => {});
}
// サインインできたら、端末に残っている自己ベストも送っておく（サインイン前に遊んだぶん）
function sendBests() {
  try {
    send(false, localStorage.getItem('ponpon-pai-best'));
    send(true, localStorage.getItem('ponpon-pai-best-endless'));
  } catch (e) {}
}
function onSignIn(ok) {
  const was = signedIn; signedIn = !!ok;
  if (signedIn && !was) sendBests();
  return signedIn;
}
GC.addListener('signInChange', e => onSignIn(e.signedIn));
const signIn = () => GC.signIn().then(r => onSignIn(r.signedIn)).catch(() => false);
signIn();

window.GameCenter = {
  submit: send,
  // ランキング画面を開けたら true（サインインしていない・キャンセルされたら false）
  async show(endless) {
    if (!signedIn && !(await signIn())) return false;
    try { await GC.showLeaderboard({ leaderboardId: board(endless) }); return true; } catch (e) { return false; }
  },
};
})();
