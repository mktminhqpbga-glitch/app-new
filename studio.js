/* MooZ Studio v3 — bản hoàn chỉnh, sáng tạo từ luồng Workflow của app-mooz.
   Không tự gửi AI, không tự tạo video, không tự đăng bài thật.
   Dữ liệu chỉ lưu trên máy (localStorage), xuất/nhập bằng JSON. */
(() => {
  const SIZES = ['9:16', '16:9', '1:1', '4:3', '3:4'];
  const SHOT_SIZES = ['', 'Toàn cảnh', 'Trung cảnh', 'Cận cảnh', 'Đặc tả'];
  const CAMERA_PRESETS = ['', 'Quay theo nhẹ', 'Quay vòng chậm', 'Máy tĩnh, không di chuyển', 'Lia máy chậm từ trái sang phải', 'Zoom chậm vào nhân vật'];
  const MOODS = ['', 'Ấm áp, nhẹ nhàng', 'Hồi hộp, dồn dập', 'Buồn, chậm rãi', 'Vui tươi, nhanh', 'Trang trọng, lặng'];
  const CHECK_ITEMS = [['nhanvat', 'Nhân vật đúng người, đúng mặt'], ['trangphuc', 'Trang phục đúng mẫu, không thêm/bớt chi tiết'], ['khongchuloi', 'Không có chữ lạ, chữ ngược trong khung hình']];
  const PLATFORMS = ['Facebook Page', 'YouTube', 'Instagram', 'TikTok'];
  const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max || 20000);
  let n = 0; const uid = (p) => (p || 'id') + '-' + (Date.now().toString(36)) + '-' + (n++);

  function parseScript(text) {
    const raw = String(text || '');
    if (!raw.trim() || raw.length > 500000) throw Error('Kịch bản từ 1 đến 500.000 ký tự.');
    let title = 'Phim chưa đặt tên', characters = [], style = '', act = '', part = '', segment = '';
    let scenes = [], cur = null;
    for (const lineRaw of raw.split(/\r?\n/)) {
      const line = lineRaw.trim(); if (!line) continue; let m;
      if ((m = line.match(/^TÊN PHIM\s*:\s*(.+)$/i))) { title = clean(m[1], 150); continue; }
      if ((m = line.match(/^NHÂN VẬT\s*:\s*(.+)$/i))) { characters = m[1].split(/;\s*/).filter(Boolean).map((c) => ({ id: uid('char'), name: c.split(/[,，]/)[0].trim(), description: c })); continue; }
      if ((m = line.match(/^BỐI CẢNH\s*:\s*(.+)$/i))) { style = m[1]; continue; }
      if ((m = line.match(/^(?:HỒI|CHƯƠNG)\s*\d+\s*:\s*(.+)$/i))) { act = m[1]; continue; }
      if ((m = line.match(/^PHẦN\s*\d+\s*:\s*(.+)$/i))) { part = m[1]; continue; }
      if ((m = line.match(/^ĐOẠN\s*\d+\s*:\s*(.+)$/i))) { segment = m[1]; continue; }
      if ((m = line.match(/^CẢNH\s*\d+\s*(?:\([^)]*\))?\s*:\s*(.+)$/i))) {
        cur = { id: uid('shot'), title: [act, part, segment, m[1]].filter(Boolean).join(' · '), imagePrompt: '', videoPrompt: '', audio: '', camera: '', cameraPreset: '', shotSize: '', mood: '', checks: {}, duration: 5, size: '16:9', status: 'cho-duyet' };
        scenes.push(cur); continue;
      }
      if (cur) {
        if ((m = line.match(/^Prompt ảnh\s*:\s*(.+)$/i))) cur.imagePrompt = m[1];
        else if ((m = line.match(/^Prompt video\s*:\s*(.+)$/i))) cur.videoPrompt = m[1];
        else if ((m = line.match(/^Audio\s*:\s*(.+)$/i))) cur.audio = m[1];
        else if ((m = line.match(/^Máy quay\s*:\s*(.+)$/i))) cur.camera = m[1];
      }
    }
    if (!scenes.length) throw Error('Chưa tìm thấy CẢNH nào. Viết theo mẫu: CẢNH 1: Tên cảnh, rồi Prompt ảnh / Prompt video.');
    return { title, characters, style, shots: scenes };
  }
  function shotPrompt(film, shot, kind) {
    const parts = [];
    if (film.style) parts.push('Phong cách: ' + film.style);
    for (const c of film.characters) parts.push('Nhân vật: ' + (c.description || c.name));
    if (kind === 'image') { if (shot.imagePrompt) parts.push('Ảnh khung đầu: ' + shot.imagePrompt); return parts.join('\n'); }
    if (shot.shotSize) parts.push('Cỡ cảnh: ' + shot.shotSize);
    if (shot.videoPrompt) parts.push(shot.videoPrompt);
    if (shot.cameraPreset) parts.push('Chuyển động máy: ' + shot.cameraPreset);
    if (shot.camera) parts.push('Máy quay: ' + shot.camera);
    if (shot.mood) parts.push('Cảm xúc: ' + shot.mood);
    if (shot.audio) parts.push('Âm thanh: ' + shot.audio);
    return parts.join(' ');
  }
  function totalDuration(shots) { return shots.reduce((s, x) => s + (Number(x.duration) || 0), 0); }
  function validateShot(shot) {
    if (!clean(shot.title, 150)) throw Error('Shot thiếu tên.');
    if (!Number.isFinite(Number(shot.duration)) || Number(shot.duration) < 1 || Number(shot.duration) > 60) throw Error('Thời lượng shot từ 1 đến 60 giây.');
    if (!SIZES.includes(shot.size)) throw Error('Tỷ lệ shot không hợp lệ.');
    if (!shot.imagePrompt && !shot.videoPrompt) throw Error('Shot "' + shot.title + '" chưa có prompt ảnh hoặc video.');
    return true;
  }
  function affiliateAngles(product) {
    const name = clean(product.name, 150) || 'Sản phẩm';
    return [
      { angle: 'Vấn đề -> giải pháp', script: name + ' giải quyết nỗi khó chịu hằng ngày như thế nào? Mở đầu bằng tình huống thật, rồi cho thấy sản phẩm trong tay, kết bằng lời kêu gọi xem link.' },
      { angle: 'Trải nghiệm thật', script: 'Cầm ' + name + ' trên tay, quay cận chất liệu, cách dùng từng bước, nói rõ điểm thích và điểm cần lưu ý, không phóng đại.' },
      { angle: 'So sánh nhanh', script: 'Đặt ' + name + ' cạnh cách làm cũ: nhanh hơn ở đâu, gọn hơn ở đâu, hợp với ai? Kết bằng 3 ý chính và link mua.' },
    ];
  }
  const Logic = { parseScript, shotPrompt, totalDuration, validateShot, affiliateAngles, SIZES };
  if (typeof globalThis !== 'undefined') globalThis.MoozStudioLogic = Logic;
  if (typeof document === 'undefined') return;

  // ---- State v3: đa dự án ----
  const KEY = 'mooz-studio-v3', OLD_KEY = 'mooz-studio-v1';
  function normShot(sh) {
    const x = (sh && typeof sh === 'object') ? sh : {};
    return { id: typeof x.id === 'string' ? x.id : uid('shot'), title: typeof x.title === 'string' ? x.title : 'Shot chưa đặt tên', imagePrompt: typeof x.imagePrompt === 'string' ? x.imagePrompt : '', videoPrompt: typeof x.videoPrompt === 'string' ? x.videoPrompt : '', audio: typeof x.audio === 'string' ? x.audio : '', camera: typeof x.camera === 'string' ? x.camera : '', cameraPreset: typeof x.cameraPreset === 'string' ? x.cameraPreset : '', shotSize: typeof x.shotSize === 'string' ? x.shotSize : '', mood: typeof x.mood === 'string' ? x.mood : '', checks: (x.checks && typeof x.checks === 'object') ? x.checks : {}, duration: Number.isFinite(Number(x.duration)) ? Number(x.duration) : 5, size: SIZES.includes(x.size) ? x.size : '16:9', status: ['cho-duyet', 'da-duyet', 'hoan-thanh'].includes(x.status) ? x.status : 'cho-duyet' };
  }
  function normProject(p) {
    const x = (p && typeof p === 'object') ? p : {};
    const film = (x.film && typeof x.film === 'object') ? x.film : {};
    return { id: typeof x.id === 'string' ? x.id : uid('proj'), name: typeof x.name === 'string' && x.name ? x.name : (typeof x.project === 'string' && x.project ? x.project : 'Dự án chưa đặt tên'), script: typeof x.script === 'string' ? x.script : '', film: { title: typeof film.title === 'string' ? film.title : '', style: typeof film.style === 'string' ? film.style : '', characters: Array.isArray(film.characters) ? film.characters.map((c) => ({ id: typeof c.id === 'string' ? c.id : uid('char'), name: typeof c.name === 'string' ? c.name : '', description: typeof c.description === 'string' ? c.description : (typeof c.name === 'string' ? c.name : '') })) : [], shots: Array.isArray(film.shots) ? film.shots.map(normShot) : [] }, createdAt: x.createdAt || Date.now(), updatedAt: Date.now() };
  }
  function normState(s) {
    const x = (s && typeof s === 'object') ? s : {};
    let projects = Array.isArray(x.projects) && x.projects.length ? x.projects.map(normProject) : [];
    if (!projects.length && x.film) projects = [normProject(x)]; // chuyển từ bản v1/v2 (1 dự án)
    if (!projects.length) projects = [normProject({ name: 'Dự án đầu tiên' })];
    return { projects, currentProjectId: projects.some((p) => p.id === x.currentProjectId) ? x.currentProjectId : projects[0].id, brands: Array.isArray(x.brands) ? x.brands : [{ id: uid('brand'), name: '', tone: '', colors: '', notes: '' }], activeBrandId: x.activeBrandId || null, posts: Array.isArray(x.posts) ? x.posts : [], affiliate: (x.affiliate && typeof x.affiliate === 'object') ? x.affiliate : { name: '', link: '', desc: '' }, promptLibrary: Array.isArray(x.promptLibrary) ? x.promptLibrary : [] };
  }
  let state;
  try { state = normState(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch { state = normState(null); }
  if (!state.activeBrandId && state.brands.length) state.activeBrandId = state.brands[0].id;
  const cp = () => state.projects.find((p) => p.id === state.currentProjectId) || state.projects[0];
  const film = () => cp().film;
  const brand = () => state.brands.find((b) => b.id === state.activeBrandId) || state.brands[0];
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const save = () => { try { cp().updatedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(state)); const el = $('saveStatus'); if (el) el.textContent = 'Đã lưu trên máy này · ' + new Date().toLocaleTimeString('vi-VN'); } catch { const el = $('saveStatus'); if (el) el.textContent = 'Không lưu được (bộ nhớ đầy). Hãy xuất JSON.'; } };
  function toast(msg) { const box = $('toasts'); if (!box) return; const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; box.appendChild(d); setTimeout(() => d.remove(), 3500); }
  function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'application/json' })); a.download = name; a.click(); }
  async function copyText(text, doneMsg) { try { await navigator.clipboard.writeText(text); toast(doneMsg || 'Đã sao chép.'); } catch { alert('Không sao chép tự động được. Hãy bôi đen và sao chép thủ công:\n\n' + text); } }
  let view = 'overview', lastAngles = [], shotFilter = 'all', shotSearch = '';
  const VIEWS = [['overview', 'Tổng quan', 'Tổng quan'], ['script', 'Kịch bản', 'Làm phim'], ['characters', 'Nhân vật', 'Làm phim'], ['shots', 'Shot & Prompt', 'Làm phim'], ['storyboard', 'Storyboard', 'Làm phim'], ['queue', 'Duyệt & Hàng đợi', 'Làm phim'], ['timeline', 'Ghép & Timeline', 'Làm phim'], ['posting', 'Đăng bài', 'Nội dung'], ['affiliate', 'Affiliate Shopee', 'Nội dung'], ['brand', 'Thương hiệu', 'Nội dung'], ['library', 'Thư viện prompt', 'Nội dung']];
  function statusLabel(s) { return s === 'hoan-thanh' ? 'Đã có video' : s === 'da-duyet' ? 'Đã duyệt' : 'Chờ duyệt'; }
  function consistencyIssues() {
    const issues = [], seen = {};
    for (const s of film().shots) {
      if (s.duration > 10) issues.push('Shot "' + s.title + '" dài ' + s.duration + 's — nên tách thành 2 shot ngắn cho dễ kiểm soát.');
      if (!s.camera && !s.cameraPreset) issues.push('Shot "' + s.title + '" chưa chọn chuyển động máy.');
      if (!s.imagePrompt && !s.videoPrompt) issues.push('Shot "' + s.title + '" chưa có prompt nào.');
      if (seen[s.title]) issues.push('Trùng tên shot: "' + s.title + '" — đổi tên để khỏi nhầm khi ghép.');
      seen[s.title] = true;
      const done = CHECK_ITEMS.filter(([k]) => s.checks && s.checks[k]).length;
      if (s.status !== 'cho-duyet' && done < CHECK_ITEMS.length) issues.push('Shot "' + s.title + '" mới kiểm ' + done + '/' + CHECK_ITEMS.length + ' mục trong bảng kiểm duyệt.');
    }
    return issues;
  }

  function on(id, ev, fn) { const el = $(id); if (el) el[ev] = fn; }
  function renderHeader() {
    const sel = $('projectSelect'); if (sel) sel.innerHTML = state.projects.map((p) => `<option value="${esc(p.id)}" ${p.id === state.currentProjectId ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
    const pn = $('projectName'); if (pn) pn.value = cp().name;
  }
  function renderNav() {
    const nav = $('nav'); if (!nav) return;
    let html = '', lastGroup = '';
    for (const [id, label, group] of VIEWS) {
      if (group !== lastGroup) { html += `<div class="section">${esc(group)}</div>`; lastGroup = group; }
      html += `<button type="button" class="${view === id ? 'active' : ''}" data-view="${id}">${esc(label)}</button>`;
    }
    nav.innerHTML = html;
    document.querySelectorAll('#nav button').forEach((b) => b.onclick = () => { view = b.dataset.view; render(); });
  }
  function shotCard(shot, i) {
    const done = CHECK_ITEMS.filter(([k]) => shot.checks && shot.checks[k]).length;
    return `<article class="shot"><header><div><strong>${i + 1}. ${esc(shot.title)}</strong><br><span class="tag">${esc(shot.size)}</span><span class="tag">${shot.duration}s</span><span class="tag ${shot.status === 'hoan-thanh' ? 'ok' : ''}">${statusLabel(shot.status)}</span><span class="tag">Kiểm ${done}/${CHECK_ITEMS.length}</span></div><div class="row">
      <button type="button" data-up="${shot.id}">↑</button><button type="button" data-down="${shot.id}">↓</button><button type="button" data-dup="${shot.id}">Nhân bản</button><button type="button" class="danger" data-del="${shot.id}">Xóa</button></div></header>
      <label>Tên shot<input data-field="title" data-id="${shot.id}" value="${esc(shot.title)}"></label>
      <label>Prompt ảnh<textarea data-field="imagePrompt" data-id="${shot.id}" rows="2">${esc(shot.imagePrompt)}</textarea></label>
      <label>Prompt video<textarea data-field="videoPrompt" data-id="${shot.id}" rows="2">${esc(shot.videoPrompt)}</textarea></label>
      <div class="grid2"><div><label>Đạo diễn nhanh — cỡ cảnh<select data-field="shotSize" data-id="${shot.id}">${SHOT_SIZES.map((s) => `<option value="${esc(s)}" ${s === shot.shotSize ? 'selected' : ''}>${s || '— Chọn cỡ cảnh —'}</option>`).join('')}</select></label></div><div><label>Chuyển động máy<select data-field="cameraPreset" data-id="${shot.id}">${CAMERA_PRESETS.map((s) => `<option value="${esc(s)}" ${s === shot.cameraPreset ? 'selected' : ''}>${s || '— Chọn chuyển động —'}</option>`).join('')}</select></label></div></div>
      <div class="grid2"><div><label>Cảm xúc<select data-field="mood" data-id="${shot.id}">${MOODS.map((s) => `<option value="${esc(s)}" ${s === shot.mood ? 'selected' : ''}>${s || '— Chọn cảm xúc —'}</option>`).join('')}</select></label></div><div><label>Máy quay (ghi chú thêm)<input data-field="camera" data-id="${shot.id}" value="${esc(shot.camera)}"></label></div></div>
      <div class="grid2"><div><label>Thời lượng (giây)<input type="number" min="1" max="60" data-field="duration" data-id="${shot.id}" value="${shot.duration}"></label></div><div><label>Tỷ lệ<select data-field="size" data-id="${shot.id}">${SIZES.map((s) => `<option ${s === shot.size ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div></div>
      <div><strong>Bảng kiểm duyệt — tick trước khi duyệt:</strong>${CHECK_ITEMS.map(([k, label]) => `<label style="font-weight:400"><input type="checkbox" data-check="${k}" data-id="${shot.id}" ${shot.checks && shot.checks[k] ? 'checked' : ''}> ${label}</label>`).join('')}</div>
      <div class="row"><button type="button" class="primary" data-approve="${shot.id}">Duyệt shot này</button><button type="button" data-copy="${shot.id}">Sao chép prompt video</button><button type="button" data-copyimg="${shot.id}">Sao chép prompt ảnh</button><button type="button" data-savelib="${shot.id}">Lưu prompt vào thư viện</button><span class="status" id="st-${shot.id}"></span></div>
      <details><summary>Prompt video đã ghép (giữ nhân vật + phong cách)</summary><pre style="white-space:pre-wrap">${esc(shotPrompt(film(), shot, 'video'))}</pre></details></article>`;
  }
  function bindShots(root) {
    root.querySelectorAll('[data-field]').forEach((el) => {
      const handler = () => { const shot = film().shots.find((x) => x.id === el.dataset.id); if (!shot) return; shot[el.dataset.field] = el.dataset.field === 'duration' ? Number(el.value) : el.value; save(); };
      el.oninput = handler; el.onchange = handler;
    });
    root.querySelectorAll('[data-check]').forEach((el) => el.onchange = () => { const shot = film().shots.find((x) => x.id === el.dataset.id); if (!shot) return; shot.checks = shot.checks || {}; shot.checks[el.dataset.check] = !!el.checked; save(); render(); });
    root.querySelectorAll('[data-up]').forEach((b) => b.onclick = () => moveShot(b.dataset.up, -1));
    root.querySelectorAll('[data-down]').forEach((b) => b.onclick = () => moveShot(b.dataset.down, 1));
    root.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { film().shots = film().shots.filter((x) => x.id !== b.dataset.del); save(); render(); toast('Đã xóa shot.'); });
    root.querySelectorAll('[data-dup]').forEach((b) => b.onclick = () => { const s = film().shots.find((x) => x.id === b.dataset.dup); if (!s) return; const copy = normShot({ ...s, id: uid('shot'), title: s.title + ' (bản sao)' }); film().shots.splice(film().shots.indexOf(s) + 1, 0, copy); save(); render(); toast('Đã nhân bản shot.'); });
    root.querySelectorAll('[data-approve]').forEach((b) => b.onclick = () => { const s = film().shots.find((x) => x.id === b.dataset.approve); try { validateShot(s); s.status = 'da-duyet'; save(); render(); toast('Đã duyệt: ' + s.title); } catch (e) { alert(e.message); } });
    root.querySelectorAll('[data-copy]').forEach((b) => b.onclick = async () => { const s = film().shots.find((x) => x.id === b.dataset.copy); if (!s) return; await copyText(shotPrompt(film(), s, 'video')); const el = $('st-' + s.id); if (el) el.textContent = 'Đã sao chép.'; });
    root.querySelectorAll('[data-copyimg]').forEach((b) => b.onclick = async () => { const s = film().shots.find((x) => x.id === b.dataset.copyimg); if (!s) return; await copyText(shotPrompt(film(), s, 'image')); });
    root.querySelectorAll('[data-savelib]').forEach((b) => b.onclick = () => { const s = film().shots.find((x) => x.id === b.dataset.savelib); if (!s) return; state.promptLibrary.push({ id: uid('lib'), name: s.title, text: shotPrompt(film(), s, 'video') }); save(); toast('Đã lưu prompt vào thư viện.'); });
  }
  function moveShot(id, d) { const shots = film().shots; const i = shots.findIndex((x) => x.id === id); const j = i + d; if (i < 0 || j < 0 || j >= shots.length) return; [shots[i], shots[j]] = [shots[j], shots[i]]; save(); render(); }
  function graphSvg() {
    const f = film(); if (!f.shots.length) return '<p class="hint">Chưa có đồ thị. Dán kịch bản ở bước Kịch bản trước.</p>';
    const nodes = [{ k: 'film', t: f.title || 'Phim', x: 20, y: 100 }, ...f.characters.map((c, i) => ({ k: 'char', t: c.name, x: 220, y: 30 + i * 50 })), ...f.shots.slice(0, 8).map((s, i) => ({ k: 'shot', t: s.title, x: 460, y: 20 + i * 28 }))];
    const edges = nodes.slice(1).map((nd) => `<line x1="90" y1="110" x2="${nd.x}" y2="${nd.y + 10}" stroke="#475569" />`).join('');
    const rects = nodes.map((nd) => `<g><rect x="${nd.x}" y="${nd.y}" width="150" height="22" rx="6" fill="${nd.k === 'film' ? '#facc15' : nd.k === 'char' ? '#7dd3fc' : '#fda4af'}"/><title>${esc(nd.t)}</title></g>`).join('');
    return `<svg class="graph" viewBox="0 0 640 240" role="img" aria-label="Đồ thị phim">${edges}${rects}</svg><p class="hint">Đồ thị rút gọn: Phim ở trái, nhân vật ở giữa, tối đa 8 shot đầu ở phải.</p>`;
  }
  function render() {
    renderHeader(); renderNav();
    const f = film(), p = cp();
    const total = f.shots.length, reviewed = f.shots.filter((x) => x.status !== 'cho-duyet').length, done = f.shots.filter((x) => x.status === 'hoan-thanh').length;
    const stepsEl = $('steps'); if (stepsEl) stepsEl.innerHTML = `<span class="${total ? 'done' : 'now'}">Kịch bản · ${total} shot</span><span class="${reviewed ? 'done' : ''}">Duyệt · ${reviewed}/${total}</span><span>Ghép · ${totalDuration(f.shots)}s</span><span class="${done ? 'done' : ''}">Đã có video · ${done}/${total}</span><span class="${state.posts.length ? 'done' : ''}">Đăng · ${state.posts.length} bản nháp</span>`;
    let html = '';
    if (view === 'overview') {
      const allShots = state.projects.reduce((s, pr) => s + pr.film.shots.length, 0);
      html = `<div class="card"><h2>${esc(f.title || 'Chưa có phim nào')}</h2><p>Dự án đang mở: <strong>${esc(p.name)}</strong> · Làm theo từng bước ở menu bên trái. App không tự gửi AI, không tự đăng bài thật.</p><div class="grid4"><div><p class="kpi">${state.projects.length}</p><p class="kpi-label">Dự án</p></div><div><p class="kpi">${allShots}</p><p class="kpi-label">Shot (tất cả dự án)</p></div><div><p class="kpi">${done}/${total}</p><p class="kpi-label">Đã có video (dự án này)</p></div><div><p class="kpi">${totalDuration(f.shots)}s</p><p class="kpi-label">Tổng thời lượng dự kiến</p></div></div><div class="progress" style="margin-top:12px"><div style="width:${total ? Math.round(done / total * 100) : 0}%"></div></div><p class="hint">Tiến độ video: ${total ? Math.round(done / total * 100) : 0}%</p><div class="row"><button class="primary" type="button" data-go="script">Bắt đầu từ kịch bản</button><button type="button" id="expAllBtn">Xuất tất cả JSON</button><label style="margin:0">Nhập JSON <input id="impAllFile" type="file" accept=".json,application/json" style="display:inline;width:auto"></label></div><p class="status" id="ovStatus"></p></div><div class="card"><h3>Đồ thị phim</h3>${graphSvg()}</div><div class="card"><h3>Tất cả dự án</h3>${state.projects.map((pr) => `<div class="shot"><strong>${esc(pr.name)}</strong> · ${esc(pr.film.title || 'Chưa có phim')} · ${pr.film.shots.length} shot · ${totalDuration(pr.film.shots)}s<div class="row"><button type="button" data-openproj="${pr.id}">Mở</button><button type="button" data-dupproj="${pr.id}">Nhân bản</button><button type="button" class="danger" data-delproj="${pr.id}">Xóa</button></div></div>`).join('')}</div>`;
    }
    if (view === 'script') html = `<div class="card"><h2>Kịch bản</h2><p>Dán kịch bản theo mẫu, bấm Phân tích. Hệ thống chỉ tạo danh sách shot, chưa gửi AI.</p><div class="row"><button type="button" data-template="phim">Mẫu: Phim ngắn</button><button type="button" data-template="quangcao">Mẫu: Quảng cáo sản phẩm</button><button type="button" data-template="affiliate">Mẫu: Video Affiliate ngắn</button></div><textarea id="scriptText" rows="14" placeholder="TÊN PHIM: …&#10;NHÂN VẬT: Lan, 30 tuổi, áo khoác nâu&#10;BỐI CẢNH: Làng quê buổi sáng&#10;CẢNH 1: Bước ra cửa&#10;Prompt ảnh: …&#10;Prompt video: …">${esc(p.script)}</textarea><div class="row"><button class="primary" type="button" id="parseBtn">Phân tích kịch bản</button><button type="button" id="sampleBtn">Dùng kịch bản mẫu</button></div><p class="status" id="scriptStatus"></p><div id="scriptResult">${f.shots.length ? `<h3>${esc(f.title)} · ${f.characters.length} nhân vật · ${f.shots.length} shot</h3><p>Nhân vật: ${esc(f.characters.map((c) => c.name).join(', ') || '—')} · Phong cách: ${esc(f.style || '—')}</p>` : ''}</div></div>`;
    if (view === 'characters') html = `<div class="card"><h2>Nhân vật</h2><p>Nhân vật lấy từ kịch bản, bạn sửa trực tiếp ở đây. Mô tả nhân vật sẽ được ghép vào mọi prompt shot để giữ nhất quán.</p><div class="grid2"><div><label>Tên nhân vật<input id="charName" placeholder="Ví dụ: Lan"></label></div><div><label>Mô tả<input id="charDesc" placeholder="Ví dụ: Lan, 30 tuổi, áo khoác nâu"></label></div></div><button class="primary" type="button" id="addCharBtn">Thêm nhân vật</button>${f.characters.length ? f.characters.map((c) => `<div class="shot"><div class="grid2"><div><label>Tên<input data-char-field="name" data-id="${c.id}" value="${esc(c.name)}"></label></div><div><label>Mô tả<textarea data-char-field="description" data-id="${c.id}" rows="2">${esc(c.description)}</textarea></label></div></div><button type="button" class="danger" data-delchar="${c.id}">Xóa nhân vật</button></div>`).join('') : '<p class="hint">Chưa có nhân vật nào. Phân tích kịch bản ở bước Kịch bản, hoặc thêm thủ công ở trên.</p>'}</div>`;
    if (view === 'shots') {
      const issues = consistencyIssues();
      const filtered = f.shots.filter((s, i) => {
        if (shotFilter !== 'all' && s.status !== shotFilter) return false;
        if (shotSearch && !(s.title + ' ' + s.imagePrompt + ' ' + s.videoPrompt).toLowerCase().includes(shotSearch.toLowerCase())) return false;
        return true;
      });
      html = `<div class="card"><h2>Shot &amp; Prompt</h2><p>Sửa prompt từng shot, chọn preset đạo diễn nhanh, tick bảng kiểm duyệt, sao chép prompt sang AI của bạn, tải kết quả về rồi đánh dấu hoàn thành ở bước Duyệt.</p><div class="grid2"><div><label>Tìm shot<input id="shotSearch" value="${esc(shotSearch)}" placeholder="Gõ từ khóa trong tên hoặc prompt"></label></div><div><label>Lọc theo trạng thái<select id="shotFilter"><option value="all" ${shotFilter === 'all' ? 'selected' : ''}>Tất cả</option><option value="cho-duyet" ${shotFilter === 'cho-duyet' ? 'selected' : ''}>Chờ duyệt</option><option value="da-duyet" ${shotFilter === 'da-duyet' ? 'selected' : ''}>Đã duyệt</option><option value="hoan-thanh" ${shotFilter === 'hoan-thanh' ? 'selected' : ''}>Đã có video</option></select></label></div></div><div class="row"><button type="button" id="applyFilterBtn">Áp dụng lọc</button><button type="button" id="clearFilterBtn">Xóa lọc</button><button type="button" class="primary" id="addShotBtn">+ Thêm shot trống</button></div><div class="card" style="background:#f8fafc"><h3>Kiểm tra nhất quán (tự động, không dùng AI)</h3>${issues.length ? '<ul>' + issues.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>' : '<p class="status ok">Không phát hiện vấn đề: không shot dài quá 10s, không trùng tên, đã chọn chuyển động máy.</p>'}</div>${filtered.length ? filtered.map((s) => shotCard(s, f.shots.indexOf(s))).join('') : '<p class="hint">Không có shot nào khớp lọc, hoặc chưa có shot nào. Sang bước Kịch bản và phân tích trước.</p>'}</div>`;
    }
    if (view === 'storyboard') html = `<div class="card"><h2>Storyboard</h2><p>Mỗi ô là một shot, theo đúng thứ tự ghép. Đọc nhanh để kiểm tra mạch phim trước khi duyệt.</p><div class="grid3">${f.shots.map((s, i) => `<div class="shot"><strong>${i + 1}. ${esc(s.title)}</strong><br><span class="tag">${esc(s.size)}</span><span class="tag">${s.duration}s</span><span class="tag ${s.status === 'hoan-thanh' ? 'ok' : ''}">${statusLabel(s.status)}</span><p>${esc(s.imagePrompt || s.videoPrompt || 'Chưa có prompt.')}</p><p class="hint">${esc(s.shotSize || '')} ${esc(s.cameraPreset || '')} ${esc(s.mood || '')}</p></div>`).join('') || '<p class="hint">Chưa có shot nào.</p>'}</div></div>`;
    if (view === 'queue') html = `<div class="card"><h2>Duyệt &amp; Hàng đợi</h2><p>Chỉ shot đã duyệt mới được tính là sẵn sàng ghép. Tải kết quả thật từ AI về máy rồi đánh dấu hoàn thành — app không tự nhận kết quả hộ bạn.</p>${f.shots.length ? f.shots.map((s, i) => { const d = CHECK_ITEMS.filter(([k]) => s.checks && s.checks[k]).length; return `<div class="shot"><strong>${i + 1}. ${esc(s.title)}</strong> · ${s.duration}s · ${esc(s.size)} · <span class="tag ${s.status === 'hoan-thanh' ? 'ok' : ''}">${statusLabel(s.status)}</span> · Kiểm ${d}/${CHECK_ITEMS.length}<div class="row"><button type="button" class="primary" data-done="${s.id}">Đánh dấu đã có video</button><button type="button" data-unapprove="${s.id}">Trả về chờ duyệt</button></div></div>`; }).join('') : '<p class="hint">Chưa có shot nào.</p>'}</div>`;
    if (view === 'timeline') { const totalSec = totalDuration(f.shots); html = `<div class="card"><h2>Ghép &amp; Timeline</h2><p>Thứ tự dưới đây là thứ tự ghép. Dùng ↑ ↓ ở bước Shot để đổi thứ tự. Tổng thời lượng chỉ tính từ thời lượng bạn nhập, không phải thời lượng video thật.</p><div class="bar-row">${f.shots.map((s) => `<div title="${esc(s.title)} · ${s.duration}s" style="flex:${s.duration};background:${s.status === 'hoan-thanh' ? '#22c55e' : s.status === 'da-duyet' ? '#facc15' : '#e2e8f0'}">${s.duration}s</div>`).join('')}</div><p class="hint">Thanh màu: xanh = đã có video, vàng = đã duyệt, xám = chưa duyệt. Độ dài mỗi ô tỉ lệ với thời lượng shot.</p><ol>${f.shots.map((s) => `<li>${esc(s.title)} · ${s.duration}s · ${esc(s.size)} · ${s.shotSize ? esc(s.shotSize) + ' · ' : ''}${s.mood ? esc(s.mood) + ' · ' : ''}${statusLabel(s.status)}</li>`).join('') || '<li>Chưa có shot nào.</li>'}</ol><p><strong>Tổng: ${totalSec} giây</strong> · Đã có video: ${f.shots.filter((x) => x.status === 'hoan-thanh').length}/${f.shots.length}</p><div class="row"><button type="button" id="exportTimelineBtn">Xuất danh sách ghép (TXT)</button></div><p class="hint">Muốn xuất MP4 thật: ghép các video đã tải về bằng công cụ dựng của bạn theo đúng thứ tự này.</p></div>`; }
    if (view === 'posting') html = `<div class="card"><h2>Đăng bài</h2><p>Soạn bản nháp, chưa đăng thật. Muốn đăng thật, cần kết nối nền tảng và bấm Đăng ở bước riêng — bản này không tự đăng.</p><button type="button" id="captionKitBtn">Tạo bộ caption từ phim + thương hiệu</button><p class="hint">Bộ caption chỉ ghép từ tên phim, tên shot và thương hiệu bạn đã nhập — không tự bịa giá, khuyến mãi hay công dụng chưa kiểm chứng.</p><label>Tiêu đề / nội dung<textarea id="postText" rows="4" placeholder="Viết content đăng bài…"></textarea></label><div class="grid2"><div><label>Nền tảng<select id="postPlatform">${PLATFORMS.map((x) => `<option>${x}</option>`).join('')}</select></label></div><div><label>Hẹn giờ (tùy chọn)<input id="postWhen" type="datetime-local"></label></div></div><button class="primary" type="button" id="addPostBtn">Lưu bản nháp</button><div id="postList">${state.posts.map((po, i) => `<div class="shot"><strong>${esc(po.platform)}</strong> · ${esc(po.when || 'Chưa hẹn giờ')} · ${esc(po.status)}<pre style="white-space:pre-wrap">${esc(po.text)}</pre><div class="row"><button type="button" data-posted="${i}">Đánh dấu đã đăng</button><button type="button" class="danger" data-delpost="${i}">Xóa nháp</button></div></div>`).join('') || '<p class="hint">Chưa có bản nháp nào.</p>'}</div></div>`;
    if (view === 'affiliate') html = `<div class="card"><h2>Affiliate Shopee</h2><p>Dán link để giữ lại, nhập dữ kiện thật từ trang sản phẩm. App không tự đọc Shopee (trang này thường chặn), không tạo link affiliate, không kiểm tra hoa hồng.</p><label>Link sản phẩm<input id="affLink" value="${esc(state.affiliate.link)}" placeholder="https://shopee.vn/…"></label><label>Tên sản phẩm<input id="affName" value="${esc(state.affiliate.name)}"></label><label>Mô tả / dữ kiện đã kiểm chứng<textarea id="affDesc" rows="4">${esc(state.affiliate.desc)}</textarea></label><button class="primary" type="button" id="affGenBtn">Tạo 3 góc kể chuyện</button><div id="affOut"></div></div>`;
    if (view === 'brand') { const b = brand(); html = `<div class="card"><h2>Thương hiệu</h2><p>Chọn một thương hiệu để sửa, hoặc thêm thương hiệu mới. Chỉ lưu trên máy này.</p><div class="row">${state.brands.map((x) => `<button type="button" class="${x.id === b.id ? 'primary' : ''}" data-selectbrand="${x.id}">${esc(x.name || 'Thương hiệu chưa đặt tên')}</button>`).join('')}</div><button type="button" id="addBrandBtn">+ Thêm thương hiệu</button><label>Tên thương hiệu<input id="brandName" value="${esc(b.name)}"></label><label>Giọng văn<input id="brandTone" value="${esc(b.tone)}"></label><label>Màu / phong cách<input id="brandColors" value="${esc(b.colors)}"></label><label>Ghi chú<textarea id="brandNotes" rows="4">${esc(b.notes)}</textarea></label><button class="primary" type="button" id="brandSaveBtn">Lưu thương hiệu</button><p class="status" id="brandStatus"></p></div>`; }
    if (view === 'library') html = `<div class="card"><h2>Thư viện prompt</h2><p>Lưu những prompt hay dùng lại. Bấm “Lưu prompt vào thư viện” trong thẻ shot để thêm nhanh, hoặc thêm thủ công ở đây.</p><label>Tên prompt<input id="libName" placeholder="Ví dụ: Prompt mở đầu phim quê"></label><label>Nội dung prompt<textarea id="libText" rows="4"></textarea></label><button class="primary" type="button" id="addLibBtn">Lưu vào thư viện</button>${state.promptLibrary.map((x, i) => `<div class="shot"><strong>${esc(x.name)}</strong><pre style="white-space:pre-wrap">${esc(x.text)}</pre><div class="row"><button type="button" data-copylib="${i}">Sao chép</button><button type="button" class="danger" data-dellib="${i}">Xóa</button></div></div>`).join('') || '<p class="hint">Thư viện chưa có prompt nào.</p>'}</div>`;
    const main = $('main'); if (main) main.innerHTML = html;
    bindView();
  }
  function bindView() {
    const go = (v) => { view = v; render(); };
    document.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => go(b.dataset.go));
    on('projectSelect', 'onchange', (e) => { state.currentProjectId = e.target.value; save(); render(); });
    on('projectName', 'oninput', (e) => { cp().name = e.target.value; save(); });
    on('newProjectBtn', 'onclick', () => { const pr = normProject({ name: 'Dự án mới ' + (state.projects.length + 1) }); state.projects.push(pr); state.currentProjectId = pr.id; save(); render(); toast('Đã tạo dự án mới.'); });
    on('resetBtn', 'onclick', () => { if (!confirm('Xóa dự án đang mở "' + cp().name + '"? Hãy xuất JSON trước nếu cần giữ.')) return; state.projects = state.projects.filter((x) => x.id !== state.currentProjectId); if (!state.projects.length) state.projects = [normProject({ name: 'Dự án đầu tiên' })]; state.currentProjectId = state.projects[0].id; save(); render(); });
    document.querySelectorAll('[data-openproj]').forEach((b) => b.onclick = () => { state.currentProjectId = b.dataset.openproj; save(); render(); });
    document.querySelectorAll('[data-dupproj]').forEach((b) => b.onclick = () => { const src = state.projects.find((x) => x.id === b.dataset.dupproj); if (!src) return; const copy = normProject({ ...JSON.parse(JSON.stringify(src)), id: uid('proj'), name: src.name + ' (bản sao)' }); state.projects.push(copy); state.currentProjectId = copy.id; save(); render(); toast('Đã nhân bản dự án.'); });
    document.querySelectorAll('[data-delproj]').forEach((b) => b.onclick = () => { if (state.projects.length <= 1) return alert('Cần giữ ít nhất 1 dự án.'); if (!confirm('Xóa dự án này?')) return; state.projects = state.projects.filter((x) => x.id !== b.dataset.delproj); if (state.currentProjectId === b.dataset.delproj) state.currentProjectId = state.projects[0].id; save(); render(); });
    if (view === 'overview') {
      on('expAllBtn', 'onclick', () => download('mooz-studio-v3.json', JSON.stringify(state, null, 2)));
      on('impAllFile', 'onchange', async (e) => { const f = e.target.files[0]; if (!f) return; try { const data = JSON.parse(await f.text()); if (!data || typeof data !== 'object') throw Error('File không phải dự án MooZ Studio.'); state = normState(data); if (!state.activeBrandId && state.brands.length) state.activeBrandId = state.brands[0].id; save(); render(); toast('Đã nhập dữ liệu.'); } catch (err) { const el = $('ovStatus'); if (el) { el.textContent = err.message; el.className = 'status error'; } } });
    }
    if (view === 'script') {
      const TEMPLATES = {
        phim: 'TÊN PHIM: Buổi sáng ở làng\nNHÂN VẬT: Lan, 30 tuổi, áo khoác nâu\nBỐI CẢNH: Làng quê buổi sáng, nắng nhẹ\nCẢNH 1: Bước ra cửa\nPrompt ảnh: Lan đứng trước cửa nhà gỗ, nắng sớm.\nPrompt video: Lan bước chậm ra ngoài.\nCẢNH 2: Con đường làng\nPrompt ảnh: Lan trên đường làng, hai bên là ruộng.\nPrompt video: Lan tiếp tục bước đi, nhìn về phía trước.',
        quangcao: 'TÊN PHIM: Giới thiệu sản phẩm\nNHÂN VẬT: Người mẫu, áo thun trơn màu đen\nBỐI CẢNH: Studio nền xám, ánh sáng mềm\nCẢNH 1: Toàn cảnh sản phẩm\nPrompt ảnh: Người mẫu mặc áo thun trơn, đứng thẳng, nền xám.\nPrompt video: Người mẫu xoay chậm một vòng, giữ nguyên trang phục.\nCẢNH 2: Cận chất liệu\nPrompt ảnh: Cận cổ áo và vai áo, thấy rõ đường may.\nPrompt video: Máy quay lia chậm từ cổ xuống thân áo.',
        affiliate: 'TÊN PHIM: Dùng thử thật\nNHÂN VẬT: Người dùng, cầm sản phẩm trên tay\nBỐI CẢNH: Trong nhà, ánh sáng tự nhiên\nCẢNH 1: Vấn đề\nPrompt ảnh: Người dùng nhìn sản phẩm cũ, vẻ băn khoăn.\nPrompt video: Người dùng đặt sản phẩm cũ xuống.\nCẢNH 2: Giải pháp\nPrompt ảnh: Người dùng cầm sản phẩm mới, mỉm cười.\nPrompt video: Người dùng dùng thử sản phẩm, quay cận tay và sản phẩm.',
      };
      document.querySelectorAll('[data-template]').forEach((b) => b.onclick = () => { cp().script = TEMPLATES[b.dataset.template] || ''; save(); render(); });
      on('scriptText', 'oninput', (e) => { cp().script = e.target.value; save(); });
      on('sampleBtn', 'onclick', () => { cp().script = TEMPLATES.phim; save(); render(); });
      on('parseBtn', 'onclick', () => { try { const f = parseScript(cp().script); cp().film = f; save(); render(); const el = $('scriptStatus'); if (el) { el.textContent = 'Đã phân tích: ' + f.shots.length + ' shot, ' + f.characters.length + ' nhân vật.'; el.className = 'status ok'; } } catch (e) { const el = $('scriptStatus'); if (el) { el.textContent = e.message; el.className = 'status error'; } } });
    }
    if (view === 'characters') {
      on('addCharBtn', 'onclick', () => { const name = $('charName') ? $('charName').value.trim() : ''; const desc = $('charDesc') ? $('charDesc').value.trim() : ''; if (!name) return alert('Nhập tên nhân vật trước.'); film().characters.push({ id: uid('char'), name, description: desc || name }); save(); render(); });
      document.querySelectorAll('[data-char-field]').forEach((el) => { const h = () => { const c = film().characters.find((x) => x.id === el.dataset.id); if (!c) return; c[el.dataset.charField] = el.value; save(); }; el.oninput = h; el.onchange = h; });
      document.querySelectorAll('[data-delchar]').forEach((b) => b.onclick = () => { film().characters = film().characters.filter((x) => x.id !== b.dataset.delchar); save(); render(); });
    }
    if (view === 'shots') {
      on('applyFilterBtn', 'onclick', () => { shotSearch = $('shotSearch') ? $('shotSearch').value : ''; shotFilter = $('shotFilter') ? $('shotFilter').value : 'all'; render(); });
      on('clearFilterBtn', 'onclick', () => { shotSearch = ''; shotFilter = 'all'; render(); });
      on('addShotBtn', 'onclick', () => { film().shots.push(normShot({ title: 'Shot mới ' + (film().shots.length + 1) })); save(); render(); });
      const main = $('main'); if (main) bindShots(main);
    }
    if (view === 'queue') {
      document.querySelectorAll('[data-done]').forEach((b) => b.onclick = () => { const s = film().shots.find((x) => x.id === b.dataset.done); if (s) { s.status = 'hoan-thanh'; save(); render(); } });
      document.querySelectorAll('[data-unapprove]').forEach((b) => b.onclick = () => { const s = film().shots.find((x) => x.id === b.dataset.unapprove); if (s) { s.status = 'cho-duyet'; save(); render(); } });
    }
    if (view === 'timeline') {
      on('exportTimelineBtn', 'onclick', () => { const lines = film().shots.map((s, i) => `${i + 1}. ${s.title} — ${s.duration}s — ${s.size} — ${statusLabel(s.status)}`).join('\n'); download('timeline-' + cp().name.replace(/\s+/g, '-') + '.txt', `Timeline: ${film().title || cp().name}\nTổng: ${totalDuration(film().shots)} giây\n\n${lines}\n`, 'text/plain'); });
    }
    if (view === 'posting') {
      on('captionKitBtn', 'onclick', () => { const title = film().title || 'Video mới'; const shots = film().shots.map((s) => s.title).join(' → '); const b = brand(); $('postText').value = title + (b.name ? ' — ' + b.name : '') + '\n' + (shots ? 'Nội dung: ' + shots + '\n' : '') + (b.tone ? 'Giọng văn: ' + b.tone + '\n' : '') + '#video #phimngan'; });
      on('addPostBtn', 'onclick', () => { const text = $('postText') ? $('postText').value.trim() : ''; if (!text) return alert('Nhập nội dung trước.'); state.posts.push({ id: uid('post'), text, platform: $('postPlatform') ? $('postPlatform').value : PLATFORMS[0], when: $('postWhen') ? $('postWhen').value : '', status: 'nhap' }); save(); render(); toast('Đã lưu bản nháp.'); });
      document.querySelectorAll('[data-delpost]').forEach((b) => b.onclick = () => { state.posts.splice(Number(b.dataset.delpost), 1); save(); render(); });
      document.querySelectorAll('[data-posted]').forEach((b) => b.onclick = () => { const po = state.posts[Number(b.dataset.posted)]; if (po) { po.status = 'da-dang'; save(); render(); } });
    }
    if (view === 'affiliate') {
      on('affGenBtn', 'onclick', () => {
        state.affiliate = { link: $('affLink') ? $('affLink').value : '', name: $('affName') ? $('affName').value : '', desc: $('affDesc') ? $('affDesc').value : '' }; save();
        lastAngles = affiliateAngles(state.affiliate);
        const out = $('affOut'); if (!out) return;
        out.innerHTML = '<h3>3 góc kể chuyện (mẫu, cần bạn sửa trước khi dùng)</h3>' + lastAngles.map((a, i) => `<div class="shot"><strong>${esc(a.angle)}</strong><p>${esc(a.script)}</p><p class="hint">Dữ kiện bạn nhập: ${esc(state.affiliate.desc || '—')} · Link giữ nguyên: ${esc(state.affiliate.link || '—')}</p><button type="button" data-saveangle="${i}">Lưu góc này thành bản nháp đăng bài</button></div>`).join('');
        document.querySelectorAll('[data-saveangle]').forEach((b) => b.onclick = () => { const a = lastAngles[Number(b.dataset.saveangle)]; if (!a) return; state.posts.push({ id: uid('post'), text: a.angle + '\n' + a.script + (state.affiliate.link ? '\nLink: ' + state.affiliate.link : ''), platform: PLATFORMS[0], when: '', status: 'nhap' }); save(); toast('Đã lưu thành bản nháp đăng bài.'); });
      });
    }
    if (view === 'brand') {
      document.querySelectorAll('[data-selectbrand]').forEach((b) => b.onclick = () => { state.activeBrandId = b.dataset.selectbrand; save(); render(); });
      on('addBrandBtn', 'onclick', () => { const nb = { id: uid('brand'), name: 'Thương hiệu mới', tone: '', colors: '', notes: '' }; state.brands.push(nb); state.activeBrandId = nb.id; save(); render(); });
      on('brandSaveBtn', 'onclick', () => { const b = brand(); b.name = $('brandName') ? $('brandName').value : ''; b.tone = $('brandTone') ? $('brandTone').value : ''; b.colors = $('brandColors') ? $('brandColors').value : ''; b.notes = $('brandNotes') ? $('brandNotes').value : ''; save(); const el = $('brandStatus'); if (el) el.textContent = 'Đã lưu thương hiệu.'; toast('Đã lưu thương hiệu.'); });
    }
    if (view === 'library') {
      on('addLibBtn', 'onclick', () => { const name = $('libName') ? $('libName').value.trim() : ''; const text = $('libText') ? $('libText').value.trim() : ''; if (!name || !text) return alert('Nhập cả tên và nội dung prompt.'); state.promptLibrary.push({ id: uid('lib'), name, text }); save(); render(); });
      document.querySelectorAll('[data-copylib]').forEach((b) => b.onclick = async () => { const x = state.promptLibrary[Number(b.dataset.copylib)]; if (x) await copyText(x.text); });
      document.querySelectorAll('[data-dellib]').forEach((b) => b.onclick = () => { state.promptLibrary.splice(Number(b.dataset.dellib), 1); save(); render(); });
    }
  }
  render();
})();
