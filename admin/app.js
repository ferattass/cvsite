/* =============================================================
   Admin editor — structured, recursive editor for content.json
   ============================================================= */
(function () {
  "use strict";

  const CSRF = window.__CSRF__ || "";
  const SECTIONS = [
    { key: "__home", label: "Panel", icon: "🏠", group: "Genel" },
    { key: "hero", label: "Giriş (Hero)", icon: "✨", group: "Site Metinleri" },
    { key: "about", label: "Hakkımda", icon: "👤", group: "Site Metinleri" },
    { key: "headings", label: "Bölüm Başlıkları", icon: "🔠", group: "Site Metinleri" },
    { key: "contactText", label: "İletişim Metni", icon: "💬", group: "Site Metinleri" },
    { key: "footer", label: "Alt Bilgi", icon: "📰", group: "Site Metinleri" },
    { key: "seo", label: "SEO / Google", icon: "🔍", group: "Site Metinleri" },
    { key: "stats", label: "İstatistik", icon: "📊", group: "İçerik" },
    { key: "experience", label: "Deneyim", icon: "💼", group: "İçerik" },
    { key: "projects", label: "Projeler", icon: "🗂️", group: "İçerik" },
    { key: "skills", label: "Yetenekler", icon: "⚡", group: "İçerik" },
    { key: "programs", label: "Programlar", icon: "🎓", group: "İçerik" },
    { key: "certifications", label: "Sertifikalar", icon: "📜", group: "İçerik" },
    { key: "education", label: "Eğitim", icon: "🏛️", group: "İçerik" },
    { key: "languages", label: "Diller", icon: "🌐", group: "İçerik" },
    { key: "contact", label: "İletişim", icon: "📇", group: "İçerik" },
    { key: "__messages", label: "Mesajlar", icon: "✉️", group: "Yönetim" },
    { key: "__cv", label: "CV Dosyaları", icon: "📄", group: "Yönetim" },
    { key: "__users", label: "Kullanıcılar", icon: "👥", group: "Yönetim" },
    { key: "__settings", label: "Ayarlar", icon: "⚙️", group: "Yönetim" },
  ];
  const secMeta = (k) => SECTIONS.find((s) => s.key === k) || { label: k, icon: "•" };
  const LABELS = {
    num: "Değer", tr: "TR", en: "EN", icon: "İkon (emoji)", name: "İsim",
    role: "Rol", company: "Şirket", date: "Tarih", badge: "Rozet", sub: "Alt başlık",
    link: "Bağlantı (URL)", live: "Canlı mı?", tags: "Etiketler", bullets: "Maddeler",
    title: "Başlık", items: "Öğeler", desc: "Açıklama", verify: "Doğrulama linki",
    school: "Okul", degree: "Bölüm", level: "Seviye", pct: "Yüzde (0-100)",
    label: "Etiket", value: "Değer", href: "Bağlantı",
    // Site metinleri (hero / about / headings / contact / footer / seo)
    available: "Durum rozeti", hi: "Selamlama", iam: "“Ben bir…” öncesi metin",
    summary: "Özet paragrafı", ctaWork: "Buton: Projeler", ctaContact: "Buton: İletişim",
    scroll: "“Kaydır” yazısı", roles: "Unvanlar (yazı animasyonu)",
    lead: "Giriş paragrafı", body: "Devam paragrafı",
    experience: "Deneyim bölüm başlığı", projects: "Projeler bölüm başlığı",
    skills: "Yetenekler bölüm başlığı", programs: "Programlar bölüm başlığı",
    credentials: "Sertifikalar & Eğitim başlığı", certs: "“Sertifikalar” alt başlığı",
    education: "“Eğitim” alt başlığı", languages: "“Diller” alt başlığı",
    heading: "Üst başlık", text: "Paragraf", rights: "Telif metni",
    description: "Açıklama (arama sonucu)", googleVerify: "Google doğrulama kodu",
  };

  let state = {};
  let active = "__home";
  let msgBadgeEl = null;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const statusEl = $("#status");

  function el(tag, props, kids) {
    const n = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === "class") n.className = props[k];
      else if (k === "html") n.innerHTML = props[k];
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), props[k]);
      else if (props[k] != null) n.setAttribute(k, props[k]);
    }
    (kids || []).forEach((c) => c && n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return n;
  }
  const lab = (k) => LABELS[k] || k;
  const isLangPair = (v) =>
    v && typeof v === "object" && !Array.isArray(v) &&
    Object.keys(v).every((k) => k === "tr" || k === "en") &&
    Object.values(v).every((x) => typeof x === "string");
  const longish = (v, k) => (typeof v === "string" && v.length > 40) || ["desc", "sub"].includes(k);

  /* ---------- field renderers ---------- */
  function field(parent, key, labelText) {
    const v = parent[key];

    if (typeof v === "boolean") {
      const cb = el("input", { type: "checkbox" });
      cb.checked = v;
      cb.addEventListener("change", () => (parent[key] = cb.checked));
      const row = el("label", { class: "fld fld--toggle" }, [cb, lab(key)]);
      return row;
    }
    if (typeof v === "number") {
      const inp = el("input", { type: "number", value: v });
      inp.addEventListener("input", () => (parent[key] = inp.value === "" ? 0 : Number(inp.value)));
      return el("div", { class: "fld" }, [el("label", null, [labelText || lab(key)]), inp]);
    }
    if (typeof v === "string" || v == null) {
      const inp = longish(v, key)
        ? el("textarea", null, [v || ""])
        : el("input", { type: "text", value: v || "" });
      inp.addEventListener("input", () => (parent[key] = inp.value));
      return el("div", { class: "fld" }, [el("label", null, [labelText || lab(key)]), inp]);
    }
    if (isLangPair(v)) {
      const mk = (lng) => {
        const long = longish(v[lng] || "", key);
        const inp = long ? el("textarea", null, [v[lng] || ""]) : el("input", { type: "text", value: v[lng] || "" });
        inp.addEventListener("input", () => (v[lng] = inp.value));
        return el("div", { class: "fld" }, [el("label", null, [el("span", { class: "lng-chip lng-chip--" + lng }, [lng.toUpperCase()])]), inp]);
      };
      return el("div", { class: "fld" }, [
        el("label", null, [labelText || lab(key)]),
        el("div", { class: "pair" }, [mk("tr"), mk("en")]),
      ]);
    }
    if (Array.isArray(v)) return arrayField(parent, key, labelText);
    // generic object → group
    const grp = el("div", { class: "grp" }, [el("div", { class: "grp__lab" }, [labelText || lab(key)])]);
    Object.keys(v).forEach((k) => grp.appendChild(field(v, k, lab(k))));
    return grp;
  }

  function blankLike(sample) {
    if (typeof sample === "string") return "";
    if (typeof sample === "number") return 0;
    if (typeof sample === "boolean") return false;
    if (Array.isArray(sample)) return sample.length ? [blankLike(sample[0])] : [];
    if (sample && typeof sample === "object") {
      const o = {};
      for (const k in sample) o[k] = blankLike(sample[k]);
      return o;
    }
    return "";
  }

  function arrayField(parent, key, labelText) {
    const arr = parent[key];
    const wrap = el("div", { class: "grp" }, [el("div", { class: "grp__lab" }, [labelText || lab(key)])]);
    const list = el("div", { class: "list" });
    wrap.appendChild(list);

    const elemIsObj = arr.length && typeof arr[0] === "object" && !isLangPair(arr[0]);

    function redraw() {
      list.innerHTML = "";
      // short string arrays (tags) render as chips
      const chips = arr.length > 0 && arr.every((x) => typeof x === "string" && x.length < 30);
      list.classList.toggle("list--chips", chips);
      arr.forEach((item, i) => {
        if (typeof item === "string" || typeof item === "number" || isLangPair(item)) {
          const f = field(arr, i, "#" + (i + 1));
          const del = el("button", { class: "btn btn--danger btn--mini", type: "button", onclick: () => { arr.splice(i, 1); redraw(); } }, ["✕"]);
          list.appendChild(el("div", { class: "list__row" }, [f, del]));
        } else {
          // object item → mini card
          list.appendChild(objectCard(arr, i, redraw));
        }
      });
    }
    redraw();

    const addBtn = el("button", { class: "btn btn--ghost btn--mini", type: "button", onclick: () => {
      const sample = arr.length ? arr[arr.length - 1] : "";
      arr.push(blankLike(sample));
      redraw();
    } }, ["+ Ekle"]);
    wrap.appendChild(el("div", { class: "addrow" }, [addBtn]));
    return wrap;
  }

  function itemTitle(item, i) {
    const p = (x) => (x && typeof x === "object" ? x.tr || x.en : x);
    return p(item.name) || p(item.title) || p(item.company) || p(item.label) || ("Öğe " + (i + 1));
  }

  function objectCard(arr, i, redrawParent) {
    const item = arr[i];
    const body = el("div", { class: "card" });
    const up = el("button", { class: "btn btn--ghost btn--mini", type: "button", title: "Yukarı", onclick: () => { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); redrawParent(); } } }, ["↑"]);
    const dn = el("button", { class: "btn btn--ghost btn--mini", type: "button", title: "Aşağı", onclick: () => { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); redrawParent(); } } }, ["↓"]);
    const del = el("button", { class: "btn btn--danger btn--mini", type: "button", onclick: () => { if (confirm("Bu öğe silinsin mi?")) { arr.splice(i, 1); redrawParent(); } } }, ["✕ Sil"]);
    body.appendChild(el("div", { class: "card__bar" }, [
      el("div", { class: "card__title" }, ["📌 " + itemTitle(item, i)]),
      el("div", { class: "addrow" }, [up, dn, del]),
    ]));
    Object.keys(item).forEach((k) => body.appendChild(field(item, k, lab(k))));
    return body;
  }

  /* ---------- special panels: messages / CV / settings ---------- */
  const fmtDate = (iso) => (typeof iso === "string" ? iso.replace("T", " ").slice(0, 16) : "");

  function updateMsgBadge(n) {
    if (!msgBadgeEl) return;
    if (n > 0) { msgBadgeEl.textContent = n > 99 ? "99+" : String(n); msgBadgeEl.hidden = false; }
    else { msgBadgeEl.hidden = true; }
  }
  async function fetchUnread() {
    try { const r = await fetch("api.php?action=messages", { cache: "no-store" }); const j = await r.json(); updateMsgBadge(j.unread || 0); } catch (e) {}
  }

  async function renderMessages() {
    const root = $("#editor"); root.innerHTML = "";
    const head = el("div", { class: "sec" }, [
      el("p", { class: "sec__hint" }, ["İletişim formundan gelen mesajlar. Mail kutuna düşer; burada da yedeği durur."]),
    ]);
    root.appendChild(head);
    const list = el("div", { class: "sec" }); root.appendChild(list);
    list.appendChild(el("p", { class: "sec__hint" }, ["Yükleniyor…"]));
    try {
      const r = await fetch("api.php?action=messages", { cache: "no-store" });
      const j = await r.json();
      const msgs = j.messages || [];
      const unread = (typeof j.unread === "number") ? j.unread : msgs.filter((m) => !m.read).length;
      updateMsgBadge(unread);
      list.innerHTML = "";
      if (unread > 0) {
        head.appendChild(el("div", { class: "addrow" }, [
          el("button", { class: "btn btn--ghost btn--mini", type: "button", onclick: () => markAll() }, ["✓ Tümünü okundu işaretle (" + unread + ")"]),
        ]));
      }
      if (!msgs.length) { list.appendChild(el("div", { class: "card" }, [el("div", { class: "sec__hint" }, ["Henüz mesaj yok."])])); return; }
      msgs.forEach((m) => list.appendChild(messageCard(m)));
    } catch (e) { list.innerHTML = ""; list.appendChild(el("p", { class: "sec__hint" }, ["Mesajlar yüklenemedi."])); }
  }
  function messageCard(m) {
    const unread = !m.read;
    const card = el("div", { class: "card" + (unread ? " card--unread" : "") });
    const titleKids = [(unread ? "🔵 " : "") + (m.name || "—")];
    if (unread) titleKids.push(el("span", { class: "msg-new" }, ["Yeni"]));
    const actions = [];
    if (unread) actions.push(el("button", { class: "btn btn--ghost btn--mini", type: "button", onclick: () => markRead(m.id) }, ["Okundu"]));
    actions.push(el("a", { class: "btn btn--ghost btn--mini",
      href: "mailto:" + encodeURIComponent(m.email || "") + "?subject=" + encodeURIComponent("Re: " + (m.subject || "")) }, ["Yanıtla"]));
    actions.push(el("button", { class: "btn btn--danger btn--mini", type: "button",
      onclick: () => { if (confirm("Mesaj silinsin mi?")) delMessage(m.id, card, unread); } }, ["Sil"]));
    card.appendChild(el("div", { class: "card__bar" }, [
      el("div", null, [
        el("div", { class: "card__title" }, titleKids),
        el("div", { class: "sec__hint" }, [(m.email || "") + "  ·  " + fmtDate(m.date)]),
      ]),
      el("div", { class: "addrow" }, actions),
    ]));
    if (m.subject) card.appendChild(el("div", { class: "fld" }, [el("label", null, ["Konu"]), el("div", null, [m.subject])]));
    card.appendChild(el("div", { class: "fld" }, [
      el("label", null, ["Mesaj"]),
      el("div", { style: "white-space:pre-wrap;color:var(--soft);font-size:.92rem" }, [m.message || ""]),
    ]));
    return card;
  }
  async function markRead(id) {
    try {
      const fd = new FormData(); fd.append("action", "mark_read"); fd.append("csrf", CSRF); fd.append("id", id);
      const r = await fetch("api.php", { method: "POST", body: fd }); const j = await r.json();
      if (j.ok) renderMessages();
    } catch (e) {}
  }
  async function markAll() {
    try {
      const fd = new FormData(); fd.append("action", "mark_all_read"); fd.append("csrf", CSRF);
      const r = await fetch("api.php", { method: "POST", body: fd }); const j = await r.json();
      if (j.ok) renderMessages();
    } catch (e) {}
  }
  async function delMessage(id, card, wasUnread) {
    try {
      const fd = new FormData(); fd.append("action", "delete_message"); fd.append("csrf", CSRF); fd.append("id", id);
      const r = await fetch("api.php", { method: "POST", body: fd }); const j = await r.json();
      if (j.ok) { card.remove(); if (wasUnread) fetchUnread(); }
    } catch (e) {}
  }

  /* ---------- About section (custom: photo uploader + text fields) ---------- */
  function renderAbout() {
    const root = $("#editor"); root.innerHTML = "";
    const a = state.about || (state.about = {});
    const m = secMeta("about");
    const sec = el("div", { class: "sec" });
    sec.appendChild(el("div", { class: "sec-head" }, [
      el("h2", { style: "font-size:1.15rem;display:flex;align-items:center;gap:9px" }, [m.icon + " " + m.label]),
      el("span", { class: "sec__hint" }, ["Düzenle → üstten Kaydet'e bas"]),
    ]));

    // Photo uploader card
    const cur = a.photo && String(a.photo).trim() ? "../" + a.photo : "../assets/facee.png";
    const img = el("img", { class: "adm-photo__img", alt: "Hakkımda görseli", src: cur });
    const file = el("input", { type: "file", accept: "image/png,image/jpeg,image/webp,image/gif" });
    const status = el("span", { class: "adm__status" });
    const up = el("button", { class: "btn btn--mini", type: "button" }, ["Yükle / Değiştir"]);
    up.addEventListener("click", () => uploadPhoto(file, status, up, img, a));
    sec.appendChild(el("div", { class: "card adm-photo" }, [
      el("div", { class: "card__bar" }, [el("div", { class: "card__title" }, ["🖼️ Hakkımda görseli"])]),
      el("div", { class: "adm-photo__row" }, [
        el("div", { class: "adm-photo__frame" }, [img]),
        el("div", { class: "adm-photo__ctrl" }, [
          el("p", { class: "sec__hint" }, ["Dikey/kare, yüksek çözünürlüklü bir fotoğraf öneririz. JPG · PNG · WebP, en fazla 8 MB. Yükleyince otomatik kaydedilir."]),
          el("div", { class: "fld" }, [file]),
          el("div", { class: "addrow" }, [up, status]),
        ]),
      ]),
    ]));

    // Text fields (everything except the photo path)
    const card = el("div", { class: "card" });
    Object.keys(a).filter((k) => k !== "photo").forEach((k) => card.appendChild(field(a, k, lab(k))));
    sec.appendChild(card);
    root.appendChild(sec);
  }
  async function uploadPhoto(fileInput, status, btn, img, a) {
    const f = fileInput.files && fileInput.files[0];
    if (!f) { status.textContent = "Önce dosya seç"; status.className = "adm__status err"; return; }
    btn.disabled = true; status.textContent = "Yükleniyor…"; status.className = "adm__status";
    try {
      const fd = new FormData();
      fd.append("action", "upload_image"); fd.append("csrf", CSRF); fd.append("slot", "about"); fd.append("file", f);
      const r = await fetch("api.php", { method: "POST", body: fd });
      const j = await r.json();
      if (j.ok) {
        a.photo = j.path;
        img.src = "../" + j.path;
        status.textContent = "✓ Yüklendi, kaydediliyor…"; status.className = "adm__status ok";
        save();   // persist content.json so the site picks up the new photo immediately
      } else { status.textContent = "Hata: " + (j.error || "?"); status.className = "adm__status err"; }
    } catch (e) { status.textContent = "Bağlantı hatası"; status.className = "adm__status err"; }
    finally { btn.disabled = false; }
  }

  function renderCvPanel() {
    const root = $("#editor"); root.innerHTML = "";
    const sec = el("div", { class: "sec" });
    sec.appendChild(el("p", { class: "sec__hint" }, ["PDF CV dosyalarını buradan güncelle. Yüklediğin dosya mevcut CV'nin yerine geçer."]));
    [["tr", "Türkçe CV", "Ferat_Tas_CV_TR.pdf"], ["en", "İngilizce CV", "Ferat_Tas_CV_EN.pdf"]].forEach(([slot, label, fname]) => {
      const file = el("input", { type: "file", accept: ".pdf,application/pdf" });
      const status = el("span", { class: "adm__status" });
      const up = el("button", { class: "btn btn--mini", type: "button" }, ["Yükle / Güncelle"]);
      up.addEventListener("click", () => uploadCv(slot, file, status, up));
      sec.appendChild(el("div", { class: "card" }, [
        el("div", { class: "card__bar" }, [
          el("div", { class: "card__title" }, ["📄 " + label]),
          el("a", { class: "btn btn--ghost btn--mini", href: "../" + fname, target: "_blank" }, ["Mevcut CV ↗"]),
        ]),
        el("div", { class: "fld" }, [el("label", null, ["PDF seç (" + fname + ")"]), file]),
        el("div", { class: "addrow" }, [up, status]),
      ]));
    });
    root.appendChild(sec);
  }
  async function uploadCv(slot, fileInput, status, btn) {
    const f = fileInput.files && fileInput.files[0];
    if (!f) { status.textContent = "Önce dosya seç"; status.className = "adm__status err"; return; }
    btn.disabled = true; status.textContent = "Yükleniyor…"; status.className = "adm__status";
    try {
      const fd = new FormData();
      fd.append("action", "upload_cv"); fd.append("csrf", CSRF); fd.append("slot", slot); fd.append("file", f);
      const r = await fetch("api.php", { method: "POST", body: fd });
      const j = await r.json();
      if (j.ok) { status.textContent = "✓ Güncellendi (" + Math.round(j.size / 1024) + " KB)"; status.className = "adm__status ok"; }
      else { status.textContent = "Hata: " + (j.error || "?"); status.className = "adm__status err"; }
    } catch (e) { status.textContent = "Bağlantı hatası"; status.className = "adm__status err"; }
    finally { btn.disabled = false; }
  }

  async function renderSettings() {
    const root = $("#editor"); root.innerHTML = "";
    const sec = el("div", { class: "sec" });
    sec.appendChild(el("p", { class: "sec__hint" }, ["Form mesajları bu hesaptan SMTP ile gönderilir ve bu adrese düşer. (Türk Ticaret PHP mail() desteklemez — bu yüzden SMTP şart.)"]));

    const email = el("input", { type: "email", placeholder: "info@ferattas.com.tr" });
    const pass = el("input", { type: "password", placeholder: "E-posta şifresi", autocomplete: "new-password" });
    const host = el("input", { type: "text", placeholder: "smtp.turkticaret.net" });
    const port = el("input", { type: "number", placeholder: "465" });
    const status = el("span", { class: "adm__status" });
    const save = el("button", { class: "btn btn--mini", type: "button" }, ["Kaydet"]);
    save.addEventListener("click", async () => {
      if (!email.value.trim()) { status.textContent = "E-posta gir"; status.className = "adm__status err"; return; }
      save.disabled = true; status.textContent = "Kaydediliyor…"; status.className = "adm__status";
      try {
        const fd = new FormData(); fd.append("action", "save_settings"); fd.append("csrf", CSRF);
        fd.append("contactEmail", email.value.trim());
        fd.append("smtpHost", host.value.trim()); fd.append("smtpPort", port.value.trim());
        fd.append("smtpPass", pass.value);   // boş = mevcut şifre korunur
        const r = await fetch("api.php", { method: "POST", body: fd }); const j = await r.json();
        if (j.ok) { status.textContent = "✓ Kaydedildi"; status.className = "adm__status ok"; pass.value = ""; pass.placeholder = "•••••••• (kayıtlı)"; }
        else { status.textContent = "Hata: " + (j.error || "?"); status.className = "adm__status err"; }
      } catch (e) { status.textContent = "Bağlantı hatası"; status.className = "adm__status err"; }
      finally { save.disabled = false; }
    });

    sec.appendChild(el("div", { class: "card" }, [
      el("div", { class: "fld" }, [el("label", null, ["İletişim e-postası (gönderen = alıcı)"]), email]),
      el("div", { class: "fld" }, [el("label", null, ["E-posta şifresi (SMTP)"]), pass]),
      el("div", { class: "pair" }, [
        el("div", { class: "fld" }, [el("label", null, ["SMTP sunucu"]), host]),
        el("div", { class: "fld" }, [el("label", null, ["Port"]), port]),
      ]),
      el("div", { class: "addrow" }, [save, status]),
      el("p", { class: "sec__hint" }, ["Türk Ticaret → sunucu: smtp.turkticaret.net, port: 465. Şifre = webmail şifren. Şifre sunucuda gizli dosyada saklanır, dışarı verilmez."]),
    ]));
    root.appendChild(sec);

    try {
      const r = await fetch("api.php?action=settings", { cache: "no-store" }); const j = await r.json();
      const s = j.settings || {};
      email.value = s.contactEmail || "";
      host.value = s.smtpHost || "smtp.turkticaret.net";
      port.value = s.smtpPort || 465;
      if (s.hasSmtpPass) pass.placeholder = "•••••••• (kayıtlı — değiştirmek için yaz)";
    } catch (e) {}
  }

  /* ---------- user management ---------- */
  const userErr = (e) => ({ bad_email: "geçersiz e-posta", weak_password: "şifre en az 8 karakter", exists: "zaten var",
    last_user: "son kullanıcı silinemez", self: "kendini silemezsin", not_found: "bulunamadı", write_failed: "yazılamadı (klasör izni?)" }[e] || e || "?");

  async function renderUsers() {
    const root = $("#editor"); root.innerHTML = "";
    root.appendChild(el("div", { class: "sec" }, [el("p", { class: "sec__hint" }, ["Panele giriş yapabilecek kullanıcılar. En az 1 kullanıcı kalmalı; kendini silemezsin."])]));
    const list = el("div", { class: "sec" }); root.appendChild(list);
    list.appendChild(el("p", { class: "sec__hint" }, ["Yükleniyor…"]));
    try {
      const r = await fetch("api.php?action=users", { cache: "no-store" });
      const j = await r.json();
      list.innerHTML = "";
      (j.users || []).forEach((email) => list.appendChild(userRow(email, j.me)));
    } catch (e) { list.innerHTML = ""; list.appendChild(el("p", { class: "sec__hint" }, ["Yüklenemedi."])); }
    root.appendChild(userAddCard());
  }
  function userRow(email, me) {
    const isSelf = email.toLowerCase() === String(me || "").toLowerCase();
    const pwd = el("input", { type: "password", placeholder: "Yeni şifre (min 8)" });
    const status = el("span", { class: "adm__status" });
    const setPw = el("button", { class: "btn btn--ghost btn--mini", type: "button", onclick: () => changePw(email, pwd, status, setPw) }, ["Şifre Değiştir"]);
    const actions = [setPw];
    if (!isSelf) actions.push(el("button", { class: "btn btn--danger btn--mini", type: "button",
      onclick: () => { if (confirm(email + " silinsin mi?")) removeUser(email, status); } }, ["Sil"]));
    return el("div", { class: "card" }, [
      el("div", { class: "card__bar" }, [
        el("div", { class: "card__title" }, ["👤 " + email + (isSelf ? "  (sen)" : "")]),
        el("div", { class: "addrow" }, actions),
      ]),
      el("div", { class: "fld" }, [el("label", null, ["Bu kullanıcının şifresini değiştir"]), pwd]),
      el("div", { class: "addrow" }, [status]),
    ]);
  }
  function userAddCard() {
    const email = el("input", { type: "email", placeholder: "yeni@ferattas.com.tr" });
    const pwd = el("input", { type: "password", placeholder: "Şifre (min 8)" });
    const status = el("span", { class: "adm__status" });
    const add = el("button", { class: "btn btn--mini", type: "button" }, ["Kullanıcı Ekle"]);
    add.addEventListener("click", async () => {
      add.disabled = true; status.textContent = "Ekleniyor…"; status.className = "adm__status";
      try {
        const fd = new FormData(); fd.append("action", "add_user"); fd.append("csrf", CSRF);
        fd.append("email", email.value.trim()); fd.append("password", pwd.value);
        const r = await fetch("api.php", { method: "POST", body: fd }); const j = await r.json();
        if (j.ok) { status.textContent = "✓ Eklendi"; status.className = "adm__status ok"; email.value = ""; pwd.value = ""; setTimeout(renderUsers, 500); }
        else { status.textContent = "Hata: " + userErr(j.error); status.className = "adm__status err"; }
      } catch (e) { status.textContent = "Bağlantı hatası"; status.className = "adm__status err"; }
      finally { add.disabled = false; }
    });
    return el("div", { class: "card" }, [
      el("div", { class: "card__title" }, ["➕ Yeni kullanıcı"]),
      el("div", { class: "pair" }, [
        el("div", { class: "fld" }, [el("label", null, ["E-posta"]), email]),
        el("div", { class: "fld" }, [el("label", null, ["Şifre"]), pwd]),
      ]),
      el("div", { class: "addrow" }, [add, status]),
    ]);
  }
  async function changePw(email, pwd, status, btn) {
    if ((pwd.value || "").length < 8) { status.textContent = "En az 8 karakter"; status.className = "adm__status err"; return; }
    btn.disabled = true; status.textContent = "Kaydediliyor…"; status.className = "adm__status";
    try {
      const fd = new FormData(); fd.append("action", "set_password"); fd.append("csrf", CSRF); fd.append("email", email); fd.append("password", pwd.value);
      const r = await fetch("api.php", { method: "POST", body: fd }); const j = await r.json();
      if (j.ok) { status.textContent = "✓ Şifre güncellendi"; status.className = "adm__status ok"; pwd.value = ""; }
      else { status.textContent = "Hata: " + userErr(j.error); status.className = "adm__status err"; }
    } catch (e) { status.textContent = "Bağlantı hatası"; status.className = "adm__status err"; }
    finally { btn.disabled = false; }
  }
  async function removeUser(email, status) {
    try {
      const fd = new FormData(); fd.append("action", "remove_user"); fd.append("csrf", CSRF); fd.append("email", email);
      const r = await fetch("api.php", { method: "POST", body: fd }); const j = await r.json();
      if (j.ok) renderUsers(); else { status.textContent = "Silinemedi: " + userErr(j.error); status.className = "adm__status err"; }
    } catch (e) {}
  }

  /* ---------- navigation (sidebar) ---------- */
  function buildNav() {
    const nav = $("#nav");
    nav.innerHTML = "";
    const groups = [];
    SECTIONS.forEach((s) => {
      let g = groups.find((x) => x.name === s.group);
      if (!g) { g = { name: s.group, items: [] }; groups.push(g); }
      g.items.push(s);
    });
    groups.forEach((g) => {
      const box = el("div", { class: "nav-group" }, [el("div", { class: "nav-group__title" }, [g.name])]);
      g.items.forEach((s) => {
        const item = el("button", { class: "nav-item" + (s.key === active ? " active" : ""), type: "button", "data-key": s.key,
          onclick: () => setActive(s.key) }, [
          el("span", { class: "nav-item__icon" }, [s.icon]),
          el("span", null, [s.label]),
        ]);
        if (s.key === "__messages") { msgBadgeEl = el("span", { class: "nav-item__badge" }); msgBadgeEl.hidden = true; item.appendChild(msgBadgeEl); }
        box.appendChild(item);
      });
      nav.appendChild(box);
    });
  }
  function setActive(key) {
    active = key;
    $$(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.key === key));
    const m = secMeta(key);
    const cr = $("#crumb"), ci = $("#crumbIcon");
    if (cr) cr.textContent = m.label;
    if (ci) ci.textContent = m.icon;
    renderSection(key);
  }

  /* ---------- dashboard (home) ---------- */
  async function renderHome() {
    const root = $("#editor"); root.innerHTML = "";
    const wrap = el("div", { class: "sec" });
    wrap.appendChild(el("h2", { style: "font-size:1.4rem;letter-spacing:-.01em" }, ["👋 Hoş geldin"]));
    wrap.appendChild(el("p", { class: "sec__hint" }, ["Sitenin içeriğini, gelen mesajları, CV'leri ve kullanıcıları buradan yönet."]));

    const mkCard = (ic, num, label) => {
      const numEl = el("div", { class: "dash-card__num" }, [String(num)]);
      const c = el("div", { class: "dash-card" }, [
        el("div", { class: "dash-card__top" }, [el("div", { class: "dash-card__ic" }, [ic])]),
        numEl, el("div", { class: "dash-card__label" }, [label]),
      ]);
      c.__num = numEl; return c;
    };
    const cProj = mkCard("🗂️", (state.projects || []).length, "Proje");
    const cExp = mkCard("💼", (state.experience || []).length, "Deneyim");
    const cMsg = mkCard("✉️", "…", "Okunmamış mesaj");
    const cUser = mkCard("👥", "…", "Kullanıcı");
    wrap.appendChild(el("div", { class: "dash-grid" }, [cProj, cExp, cMsg, cUser]));

    const recentList = el("div", null, [el("p", { class: "sec__hint" }, ["Yükleniyor…"])]);
    wrap.appendChild(el("div", { class: "dash-section" }, [el("h3", null, ["✉️ Son mesajlar"]), recentList]));

    wrap.appendChild(el("div", { class: "dash-quick" }, [
      el("button", { class: "btn btn--ghost btn--mini", type: "button", onclick: () => setActive("projects") }, ["🗂️ Projeleri düzenle"]),
      el("button", { class: "btn btn--ghost btn--mini", type: "button", onclick: () => setActive("__messages") }, ["✉️ Mesajlara git"]),
      el("button", { class: "btn btn--ghost btn--mini", type: "button", onclick: () => setActive("__settings") }, ["⚙️ Ayarlar"]),
    ]));
    root.appendChild(wrap);

    try {
      const j = await (await fetch("api.php?action=messages", { cache: "no-store" })).json();
      const msgs = j.messages || [];
      cMsg.__num.textContent = String(j.unread || 0);
      updateMsgBadge(j.unread || 0);
      recentList.innerHTML = "";
      if (!msgs.length) recentList.appendChild(el("p", { class: "sec__hint" }, ["Henüz mesaj yok."]));
      else msgs.slice(0, 4).forEach((m) => recentList.appendChild(el("div", { class: "dash-msg" }, [
        el("span", { class: "dash-msg__dot" + (m.read ? " read" : "") }),
        el("div", null, [el("div", { class: "dash-msg__name" }, [m.name || "—"]), el("div", { class: "dash-msg__meta" }, [(m.email || "") + " · " + fmtDate(m.date)])]),
      ])));
    } catch (e) { recentList.innerHTML = ""; }
    try {
      const j = await (await fetch("api.php?action=users", { cache: "no-store" })).json();
      cUser.__num.textContent = String((j.users || []).length);
    } catch (e) {}
  }

  /* ---------- sections ---------- */
  function renderSection(key) {
    if (key === "__home") return renderHome();
    if (key === "about") return renderAbout();
    if (key === "__messages") return renderMessages();
    if (key === "__cv") return renderCvPanel();
    if (key === "__users") return renderUsers();
    if (key === "__settings") return renderSettings();
    const root = $("#editor");
    root.innerHTML = "";
    const m = secMeta(key);
    const sec = el("div", { class: "sec" });
    sec.appendChild(el("div", { class: "sec-head" }, [
      el("h2", { style: "font-size:1.15rem;display:flex;align-items:center;gap:9px" }, [m.icon + " " + m.label]),
      el("span", { class: "sec__hint" }, ["Düzenle → üstten Kaydet'e bas"]),
    ]));
    const HINTS = {
      seo: "Sayfa başlığı ve açıklaması Google arama sonucunda görünür. “Google doğrulama kodu” alanına Google Search Console’dan aldığın HTML etiket kodunun yalnızca content=\"…\" kısmını yapıştır (boş bırakabilirsin).",
      hero: "Ana sayfanın en üstündeki giriş bölümü. “Unvanlar” alanındaki yazılar sırayla animasyonla yazılır.",
      headings: "Sitedeki bölümlerin büyük başlıkları (Deneyim, Projeler, Yetenekler…).",
    };
    if (HINTS[key]) sec.appendChild(el("p", { class: "sec__hint", style: "margin:-4px 0 14px" }, [HINTS[key]]));
    const v = state[key];
    if (v == null) { sec.appendChild(el("p", { class: "sec__hint" }, ["(boş)"])); root.appendChild(sec); return; }
    if (Array.isArray(v)) {
      sec.appendChild(field(state, key, m.label));
    } else {
      const card = el("div", { class: "card" });
      Object.keys(v).forEach((k) => card.appendChild(field(v, k, lab(k))));
      sec.appendChild(card);
    }
    root.appendChild(sec);
  }

  /* ---------- raw JSON mode ---------- */
  let rawMode = false;
  function toggleRaw() {
    const raw = $("#raw"), ed = $("#editor");
    rawMode = !rawMode;
    if (rawMode) {
      raw.value = JSON.stringify(state, null, 2);
      raw.hidden = false; ed.hidden = true;
    } else {
      try {
        state = JSON.parse(raw.value);
        raw.hidden = true; ed.hidden = false;
        buildNav(); setActive(active);
        setStatus("", "");
      } catch (e) {
        setStatus("JSON hatası: " + e.message, "err");
        return;
      }
    }
  }

  /* ---------- io ---------- */
  function setStatus(msg, cls) {
    statusEl.textContent = msg;
    statusEl.className = "adm__status" + (cls ? " " + cls : "");
  }

  async function load() {
    setStatus("Yükleniyor…", "");
    try {
      const r = await fetch("api.php?action=content", { cache: "no-store" });
      const j = await r.json();
      state = j.content || {};
      buildNav(); setActive(active);
      setStatus("Hazır", "ok");
      setTimeout(() => setStatus("", ""), 1200);
      fetchUnread();
      if (!window.__msgPoll) window.__msgPoll = setInterval(fetchUnread, 30000);
    } catch (e) { setStatus("Yüklenemedi", "err"); }
  }

  async function save() {
    if (rawMode) {
      try { state = JSON.parse($("#raw").value); }
      catch (e) { setStatus("JSON hatası: " + e.message, "err"); return; }
    }
    const btn = $("#saveBtn");
    btn.disabled = true; setStatus("Kaydediliyor…", "");
    try {
      const fd = new FormData();
      fd.append("action", "save");
      fd.append("csrf", CSRF);
      fd.append("content", JSON.stringify(state));
      const r = await fetch("api.php", { method: "POST", body: fd });
      const j = await r.json();
      if (j.ok) setStatus("✓ Kaydedildi", "ok");
      else setStatus("Hata: " + (j.error || "?") + (j.detail ? " (" + j.detail + ")" : ""), "err");
    } catch (e) { setStatus("Bağlantı hatası", "err"); }
    finally { btn.disabled = false; }
  }

  $("#saveBtn").addEventListener("click", save);
  $("#rawToggle").addEventListener("click", toggleRaw);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); }
  });

  // panel theme (dark/light)
  function setAdmTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("adm-theme", t); } catch (e) {}
    const b = $("#admTheme"); if (b) b.textContent = t === "dark" ? "🌙" : "☀️";
  }
  (function initTheme() {
    let t; try { t = localStorage.getItem("adm-theme"); } catch (e) {}
    setAdmTheme(t === "light" ? "light" : "dark");
    const b = $("#admTheme");
    if (b) b.addEventListener("click", () => setAdmTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
  })();

  load();
})();
