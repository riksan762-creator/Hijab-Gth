/* ar-tryon.js — lightweight "AR Fitting Room"
   Approach: live webcam feed + a positionable/scalable hijab overlay image,
   composited on a canvas the user can adjust and screenshot. No external
   face-tracking model required, so it works fully offline once loaded. */

let arState = { x:50, y:32, scale:100, rotation:0, stream:null, running:false, overlayImg:null };

function arSetOverlay(imgSrc){
  const img = new Image();
  img.src = imgSrc;
  arState.overlayImg = img;
}

async function arStart(){
  const stage = document.getElementById('ar-stage');
  const startBtn = document.getElementById('ar-start-btn');
  if(!stage) return;

  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    arState.stream = stream;
    arState.running = true;

    stage.innerHTML = `<video id="ar-video" autoplay playsinline muted></video><canvas id="ar-canvas"></canvas>`;
    const video = document.getElementById('ar-video');
    const canvas = document.getElementById('ar-canvas');
    video.srcObject = stream;

    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      arLoop(video, canvas);
    });

    document.getElementById('ar-controls-wrap').style.display = 'flex';
    if(startBtn) startBtn.style.display = 'none';
    document.getElementById('ar-stop-btn').style.display = 'inline-flex';
  }catch(err){
    showToast('Tidak bisa mengakses kamera. Cek izin browser kamu.');
  }
}

function arLoop(video, canvas){
  if(!arState.running) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width, canvas.height);

  if(arState.overlayImg && arState.overlayImg.complete){
    const img = arState.overlayImg;
    const baseW = canvas.width * 0.62 * (arState.scale/100);
    const ratio = img.naturalHeight / img.naturalWidth || 1.1;
    const baseH = baseW * ratio;
    const cx = canvas.width * (arState.x/100);
    const cy = canvas.height * (arState.y/100);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(arState.rotation * Math.PI/180);
    ctx.drawImage(img, -baseW/2, -baseH/2, baseW, baseH);
    ctx.restore();
  }
  requestAnimationFrame(() => arLoop(video, canvas));
}

function arStop(){
  arState.running = false;
  if(arState.stream){
    arState.stream.getTracks().forEach(t => t.stop());
  }
  const stage = document.getElementById('ar-stage');
  stage.innerHTML = `<div class="ar-placeholder"><div class="icon">🪞</div>
    Kamera dimatikan. Klik "Aktifkan Kamera" untuk mencoba lagi.</div>`;
  document.getElementById('ar-controls-wrap').style.display = 'none';
  document.getElementById('ar-start-btn').style.display = 'inline-flex';
  document.getElementById('ar-stop-btn').style.display = 'none';
}

function arCapture(){
  const canvas = document.getElementById('ar-canvas');
  const video = document.getElementById('ar-video');
  if(!canvas || !video){ showToast('Aktifkan kamera dulu sebelum ambil foto.'); return; }

  const out = document.createElement('canvas');
  out.width = canvas.width; out.height = canvas.height;
  const octx = out.getContext('2d');
  octx.translate(out.width,0); octx.scale(-1,1); // un-mirror for a natural photo
  octx.drawImage(video, 0, 0, out.width, out.height);
  octx.drawImage(canvas, 0, 0, out.width, out.height);

  const link = document.createElement('a');
  link.download = 'hijab-ar-tryon.png';
  link.href = out.toDataURL('image/png');
  link.click();
  showToast('Foto tersimpan ✓');
}

function arBindControls(){
  const map = { 'ar-x':'x', 'ar-y':'y', 'ar-scale':'scale', 'ar-rotation':'rotation' };
  Object.entries(map).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if(el) el.addEventListener('input', () => { arState[key] = Number(el.value); });
  });
}

document.addEventListener('DOMContentLoaded', arBindControls);
window.addEventListener('beforeunload', () => { if(arState.stream) arState.stream.getTracks().forEach(t=>t.stop()); });
