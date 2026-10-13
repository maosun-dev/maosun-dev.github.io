/* ---------- 広告（iPhoneアプリ版だけ。Web版では何もしない） ----------
 * ・ハートがなくなったときの動画広告（リワード）…見るとハートが1つ回復
 * ・タイトル画面とゲームオーバー画面の下のバナー
 * ・全画面広告（インタースティシャル）…何回に1回出すかは CONFIG_URL の設定ファイルで決める（0なら出さない）
 * Web版で見た目を確かめるときは、URLの最後に ?adpreview を付けると仮の広告が出る。
 */
(() => {
'use strict';
const cfg = window.ADS_CONFIG || null;            // アプリ版のビルドで作られる（tools/app/build-www.mjs）
const plugin = window.capacitorStripe || null;    // @capacitor-community/admob（配布ファイルのグローバル名がこの名前）
const cap = window.Capacitor;
const native = !!(cfg && plugin && cap && cap.isNativePlatform && cap.isNativePlatform());
const preview = !native && /[?&]adpreview\b/.test(location.search);
const production = !!(native && cfg.production);

// Google が用意しているテスト用の広告ユニット（開発中はこちらを使う）
const TEST = {
  banner: 'ca-app-pub-3940256099942544/2435281174',
  reward: 'ca-app-pub-3940256099942544/1712485313',
  interstitial: 'ca-app-pub-3940256099942544/4411468910',
};
// 本物の広告ユニット（ストアに出すビルドだけで使う）
const REAL = {
  banner: 'ca-app-pub-7017663942238206/1826348792',
  reward: 'ca-app-pub-7017663942238206/6347124290',
  interstitial: 'ca-app-pub-7017663942238206/5574022119',
};
const ids = production ? REAL : TEST;
const CONFIG_URL = 'https://maosun-dev.github.io/tenrakuhai/ad-config.json';

let bannerWanted = false, bannerCreated = false, bannerHeight = 0;
let rewardReady = false, rewardDone = null, rewardGot = false;
let interReady = false, interDone = null, interEvery = 0, games = 0;

// バナーの高さぶん画面の下をあける（タイトルの大きさの調整もやり直してもらう）
const setAdHeight = h => {
  document.documentElement.style.setProperty('--ad-h', Math.round(h) + 'px');
  window.dispatchEvent(new Event('resize'));
};
const fire = name => window.dispatchEvent(new Event(name));   // ゲーム側で音を止める・戻すのに使う

async function loadConfig() {
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 5000);
    const r = await fetch(CONFIG_URL + '?t=' + Date.now(), { cache: 'no-store', signal: ctl.signal });
    clearTimeout(t);
    const j = await r.json();
    const n = Math.floor(Number(j.interstitialEvery));
    interEvery = n > 0 ? n : 0;
  } catch (e) { interEvery = 0; }   // 読めなければ全画面広告は出さない
}

/* ---------- アプリ版（本物の AdMob） ---------- */
const AdMob = native ? plugin.AdMob : null;

function loadReward() {
  rewardReady = false;
  AdMob.prepareRewardVideoAd({ adId: ids.reward, isTesting: !production })
    .then(() => { rewardReady = true; })
    .catch(() => setTimeout(loadReward, 30000));
}
function loadInter() {
  interReady = false;
  AdMob.prepareInterstitial({ adId: ids.interstitial, isTesting: !production })
    .then(() => { interReady = true; })
    .catch(() => setTimeout(loadInter, 60000));
}
function finishReward() {
  // 報酬のお知らせが閉じるより少し遅れて届くことがあるので、ひと呼吸おいてから結果を返す
  setTimeout(() => { if (rewardDone) { const r = rewardDone; rewardDone = null; fire('adend'); r(rewardGot); } loadReward(); }, 300);
}
function finishInter() {
  if (interDone) { const r = interDone; interDone = null; fire('adend'); r(); }
  loadInter();
}

async function initNative() {
  try {
    const s = await AdMob.trackingAuthorizationStatus();
    if (s.status === 'notDetermined') await AdMob.requestTrackingAuthorization();
  } catch (e) {}
  try { await AdMob.initialize({ initializeForTesting: !production }); } catch (e) { return; }
  AdMob.addListener('bannerAdSizeChanged', s => { bannerHeight = s.height || 0; if (bannerWanted) setAdHeight(bannerHeight); });
  AdMob.addListener('onRewardedVideoAdReward', () => { rewardGot = true; });
  AdMob.addListener('onRewardedVideoAdDismissed', finishReward);
  AdMob.addListener('onRewardedVideoAdFailedToShow', finishReward);
  AdMob.addListener('interstitialAdDismissed', finishInter);
  AdMob.addListener('interstitialAdFailedToShow', finishInter);
  loadReward(); loadInter(); loadConfig();
  if (bannerWanted) showBanner();
}

async function showBanner() {
  bannerWanted = true;
  if (preview) { mockBanner(true); return; }
  if (!native) return;
  try {
    if (bannerCreated) await AdMob.resumeBanner();
    else {
      await AdMob.showBanner({ adId: ids.banner, adSize: 'ADAPTIVE_BANNER', position: 'BOTTOM_CENTER', margin: 0, isTesting: !production });
      bannerCreated = true;
    }
    if (!bannerWanted) { AdMob.hideBanner().catch(() => {}); return; }
    setAdHeight(bannerHeight);
  } catch (e) {}
}
function hideBanner() {
  bannerWanted = false; setAdHeight(0);
  if (preview) { mockBanner(false); return; }
  if (native && bannerCreated) AdMob.hideBanner().catch(() => {});
}

async function showReward() {
  if (preview) return mockVideo('動画広告（リワード）');
  if (!native || !rewardReady) return false;
  rewardReady = false; rewardGot = false;
  const p = new Promise(r => { rewardDone = r; });
  fire('adstart');
  try { await AdMob.showRewardVideoAd(); } catch (e) { finishReward(); }
  return p;
}

async function maybeInterstitial() {
  games++;
  if (!(interEvery > 0 && games % interEvery === 0)) return;
  if (preview) { await mockVideo('全画面広告'); return; }
  if (!native || !interReady) return;
  interReady = false;
  const p = new Promise(r => { interDone = r; });
  fire('adstart');
  try { await AdMob.showInterstitial(); } catch (e) { finishInter(); }
  return p;
}

/* ---------- Web版の仮の広告（?adpreview のときだけ） ---------- */
let mockBar = null;
function mockBanner(on) {
  if (!mockBar) {
    mockBar = document.createElement('div');
    mockBar.textContent = '広告バナー（仮）';
    mockBar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:50px;z-index:60;display:none;align-items:center;justify-content:center;background:#e9e4f5;color:#555;font:700 13px sans-serif;border-top:1px solid #bbb';
    document.body.appendChild(mockBar);
  }
  mockBar.style.display = on ? 'flex' : 'none';
  setAdHeight(on ? 50 : 0);
}
function mockVideo(label) {
  return new Promise(res => {
    fire('adstart');
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:100;background:#000;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;font:700 16px sans-serif;text-align:center';
    ov.innerHTML = `<div style="opacity:.6">${label}（仮）</div><div style="font-size:14px;opacity:.8">ここに本物の広告が流れます</div><div id="adMockSec" style="font-size:40px">3</div>`;
    document.body.appendChild(ov);
    let n = 3;
    const t = setInterval(() => {
      n--; ov.querySelector('#adMockSec').textContent = n > 0 ? n : '';
      if (n > 0) return;
      clearInterval(t);
      const b = document.createElement('button');
      b.textContent = '✕ とじる';
      b.style.cssText = 'padding:10px 22px;border-radius:999px;border:0;font:700 15px sans-serif';
      b.onclick = () => { ov.remove(); fire('adend'); res(true); };
      ov.appendChild(b);
    }, 1000);
  });
}

window.Ads = {
  enabled: native || preview,
  canRevive: () => preview || (native && rewardReady),
  showReward, showBanner, hideBanner, maybeInterstitial,
};
if (native) initNative();
else if (preview) loadConfig();
})();
