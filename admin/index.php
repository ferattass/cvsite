<?php
/**
 * Admin entry — setup (first run), login, logout, and the editor shell.
 */
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

// Ensure a trailing slash so relative assets (admin.css, app.js) resolve correctly
$reqPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '';
if ($reqPath !== '' && substr($reqPath, -1) !== '/' && strtolower(basename($reqPath)) === 'admin') {
    $qs = isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : '';
    header('Location: ' . $reqPath . '/' . $qs, true, 301);
    exit;
}

$action = $_GET['do'] ?? '';

// ---- Logout ----
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    header('Location: index.php');
    exit;
}

// ---- Login (email + password) ----
if (!is_logged_in()) {
    $err = '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        login_throttle();
        $email = (string)($_POST['email'] ?? '');
        $pw    = (string)($_POST['password'] ?? '');
        if (auth_verify($email, $pw)) { login_ok($email); header('Location: index.php'); exit; }
        login_failed();
        $err = 'E-posta veya şifre hatalı.';
    }
    render_shell('login', ['err' => $err]);
    exit;
}

// ---- Authenticated: editor app ----
render_shell('app', ['csrf' => csrf_token()]);


/* ============================ Views ============================ */
function render_shell(string $view, array $vars = []): void {
    $err  = $vars['err'] ?? '';
    $csrf = $vars['csrf'] ?? '';
    $nonce = base64_encode(random_bytes(16));
    header(
        "Content-Security-Policy: default-src 'self'; " .
        "script-src 'self' 'nonce-$nonce'; style-src 'self' 'unsafe-inline'; " .
        "img-src 'self' data:; font-src 'self'; connect-src 'self'; " .
        "frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    );
    ?>
<!DOCTYPE html>
<html lang="tr" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Yönetim Paneli — Ferat Taş</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
  <link rel="stylesheet" href="admin.css?v=5" />
</head>
<body class="adm">
<?php if ($view === 'login'): ?>
  <main class="auth">
    <form class="auth__card" method="POST" autocomplete="off">
      <div class="auth__brand"><span class="auth__mono">FT</span> Yönetim Paneli</div>
      <h1>Giriş</h1>
      <p class="auth__sub">İçeriği düzenlemek için giriş yap.</p>
      <?php if ($err): ?><div class="auth__err"><?= htmlspecialchars($err) ?></div><?php endif; ?>
      <label>E-posta</label>
      <input type="email" name="email" required autofocus autocomplete="username" />
      <label>Şifre</label>
      <input type="password" name="password" required autocomplete="current-password" />
      <button class="btn" type="submit">Giriş Yap</button>
    </form>
  </main>
<?php else: ?>
  <div class="adm-layout">
    <aside class="adm-side">
      <div class="adm-side__brand">
        <span class="auth__mono">FT</span>
        <div>İçerik Editörü<small>ferattas.com.tr</small></div>
      </div>
      <nav class="adm-side__nav" id="nav"></nav>
      <div class="adm-side__foot">
        <div class="adm-who"><strong><?= htmlspecialchars(current_admin()) ?></strong><span>Yönetici</span></div>
        <a class="adm-logout" href="index.php?do=logout" title="Çıkış">Çıkış ⏻</a>
      </div>
    </aside>

    <main class="adm-main">
      <header class="adm-top">
        <div class="adm-crumb"><span class="adm-crumb__icon" id="crumbIcon">🏠</span><span id="crumb">Panel</span></div>
        <div class="adm-actions">
          <span id="status" class="adm__status"></span>
          <button class="icon-btn" id="admTheme" type="button" title="Tema">🌙</button>
          <a class="btn btn--ghost btn--mini" href="../index.html" target="_blank">Siteyi Aç ↗</a>
          <button class="btn btn--ghost btn--mini" id="rawToggle" type="button">JSON</button>
          <button class="btn" id="saveBtn" type="button">Kaydet</button>
        </div>
      </header>
      <div class="adm-body">
        <div id="editor"></div>
        <textarea id="raw" class="adm__raw" spellcheck="false" hidden></textarea>
      </div>
    </main>
  </div>
  <script nonce="<?= htmlspecialchars($nonce) ?>">window.__CSRF__ = <?= json_encode($csrf) ?>;</script>
  <script nonce="<?= htmlspecialchars($nonce) ?>" src="app.js?v=5"></script>
<?php endif; ?>
</body>
</html>
<?php
}
