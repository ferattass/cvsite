<?php
/**
 * Admin API — load / save content.json. Auth + CSRF protected.
 *   GET  ?action=content   → current content JSON
 *   POST action=save       → validate + atomically write content.json (keeps backup)
 */
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

require_login();

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if ($action === 'content' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!is_file(CONTENT_FILE)) { echo json_encode(['ok' => true, 'content' => new stdClass()]); exit; }
    $raw = file_get_contents(CONTENT_FILE);
    $json = json_decode($raw, true);
    echo json_encode(['ok' => true, 'content' => $json]);
    exit;
}

if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'csrf']);
        exit;
    }

    $payload = $_POST['content'] ?? '';
    $data = json_decode($payload, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'invalid_json']);
        exit;
    }

    // Reject dangerous URL schemes anywhere in the content (defense-in-depth vs stored XSS)
    $bad = false;
    $scan = function ($node) use (&$scan, &$bad) {
        if (is_array($node)) { foreach ($node as $v) $scan($v); }
        elseif (is_string($node) && preg_match('/^\s*(javascript|data|vbscript)\s*:/i', $node)) $bad = true;
    };
    $scan($data);
    if ($bad) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'unsafe_url']);
        exit;
    }

    // Light structural sanity check — expected top-level keys must be arrays/objects.
    foreach (['stats', 'experience', 'projects', 'skills', 'programs', 'certifications', 'languages', 'contact'] as $k) {
        if (isset($data[$k]) && !is_array($data[$k])) {
            http_response_code(422);
            echo json_encode(['ok' => false, 'error' => 'bad_shape', 'field' => $k]);
            exit;
        }
    }

    // Backup current version
    if (is_file(CONTENT_FILE)) {
        if (!is_dir(BACKUP_DIR)) @mkdir(BACKUP_DIR, 0775, true);
        @copy(CONTENT_FILE, BACKUP_DIR . '/content-' . date('Ymd-His') . '.json');
        // keep only last 20 backups
        $bks = glob(BACKUP_DIR . '/content-*.json') ?: [];
        if (count($bks) > 20) { sort($bks); foreach (array_slice($bks, 0, count($bks) - 20) as $old) @unlink($old); }
    }

    // Atomic write
    $pretty = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $tmp = CONTENT_FILE . '.tmp';
    if (file_put_contents($tmp, $pretty, LOCK_EX) === false || !rename($tmp, CONTENT_FILE)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'write_failed']);
        exit;
    }

    echo json_encode(['ok' => true, 'savedAt' => date('c')]);
    exit;
}

// ---- Private PHP-array store helpers (files not served as text) ----
function store_read(string $p): array { if (!is_file($p)) return []; $d = @include $p; return is_array($d) ? $d : []; }
function store_write(string $p, array $d): bool { return @file_put_contents($p, "<?php\nreturn " . var_export($d, true) . ";\n", LOCK_EX) !== false; }

const ADMIN_SETTINGS = __DIR__ . '/../data/.settings.php';
const ADMIN_MESSAGES = __DIR__ . '/../data/.messages.php';

// ---- Settings (contact email) ----
if ($action === 'settings' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $s = store_read(ADMIN_SETTINGS);
    echo json_encode(['ok' => true, 'settings' => [
        'contactEmail' => $s['contactEmail'] ?? 'ferattas2763@gmail.com',
        'smtpHost'     => $s['smtpHost'] ?? 'smtp.turkticaret.net',
        'smtpPort'     => $s['smtpPort'] ?? 465,
        'hasSmtpPass'  => !empty($s['smtpPass']),   // şifrenin kendisini ASLA döndürme
    ]]);
    exit;
}
if ($action === 'save_settings' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'csrf']); exit; }
    $email = trim((string)($_POST['contactEmail'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(422); echo json_encode(['ok' => false, 'error' => 'bad_email']); exit; }
    $cur = store_read(ADMIN_SETTINGS);
    $new = [
        'contactEmail' => $email,
        'smtpHost'     => trim((string)($_POST['smtpHost'] ?? '')) ?: 'smtp.turkticaret.net',
        'smtpPort'     => (int)($_POST['smtpPort'] ?? 465) ?: 465,
        'smtpPass'     => (string)($cur['smtpPass'] ?? ''),    // varsayılan: mevcut şifreyi koru
    ];
    $pw = (string)($_POST['smtpPass'] ?? '');
    if ($pw !== '') $new['smtpPass'] = $pw;                    // boş bırakılırsa mevcut korunur
    store_write(ADMIN_SETTINGS, $new);
    echo json_encode(['ok' => true]);
    exit;
}

// ---- Contact messages inbox ----
if ($action === 'messages' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $m = store_read(ADMIN_MESSAGES);
    echo json_encode(['ok' => true, 'messages' => array_reverse($m), 'unread' => count(array_filter($m, fn($x) => empty($x['read'])))]);
    exit;
}
if ($action === 'delete_message' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'csrf']); exit; }
    $id = (string)($_POST['id'] ?? '');
    $m = array_values(array_filter(store_read(ADMIN_MESSAGES), fn($x) => ($x['id'] ?? '') !== $id));
    store_write(ADMIN_MESSAGES, $m);
    echo json_encode(['ok' => true]);
    exit;
}
if ($action === 'mark_read' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'csrf']); exit; }
    $id = (string)($_POST['id'] ?? '');
    $m = store_read(ADMIN_MESSAGES);
    foreach ($m as &$x) { if (($x['id'] ?? '') === $id) $x['read'] = true; }
    unset($x);
    store_write(ADMIN_MESSAGES, $m);
    echo json_encode(['ok' => true]);
    exit;
}
if ($action === 'mark_all_read' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'csrf']); exit; }
    $m = store_read(ADMIN_MESSAGES);
    foreach ($m as &$x) { $x['read'] = true; }
    unset($x);
    store_write(ADMIN_MESSAGES, $m);
    echo json_encode(['ok' => true]);
    exit;
}

// ---- User management ----
if ($action === 'users' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['ok' => true, 'users' => users_list_emails(), 'me' => current_admin()]);
    exit;
}
if ($action === 'add_user' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'csrf']); exit; }
    $r = users_add((string)($_POST['email'] ?? ''), (string)($_POST['password'] ?? ''));
    if (!$r['ok']) http_response_code(422);
    echo json_encode($r);
    exit;
}
if ($action === 'remove_user' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'csrf']); exit; }
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    if ($email === current_admin()) { http_response_code(422); echo json_encode(['ok' => false, 'error' => 'self']); exit; }
    $r = users_remove($email);
    if (!$r['ok']) http_response_code(422);
    echo json_encode($r);
    exit;
}
if ($action === 'set_password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'csrf']); exit; }
    $r = users_set_password((string)($_POST['email'] ?? ''), (string)($_POST['password'] ?? ''));
    if (!$r['ok']) http_response_code(422);
    echo json_encode($r);
    exit;
}

if ($action === 'upload_cv' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'csrf']);
        exit;
    }
    $slots = ['tr' => __DIR__ . '/../Ferat_Tas_CV_TR.pdf', 'en' => __DIR__ . '/../Ferat_Tas_CV_EN.pdf'];
    $slot = $_POST['slot'] ?? '';
    if (!isset($slots[$slot])) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'bad_slot']);
        exit;
    }
    if (empty($_FILES['file']) || ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'no_file']);
        exit;
    }
    $f = $_FILES['file'];
    if ($f['size'] > 12 * 1024 * 1024) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'too_large']);
        exit;
    }
    // Validate it's really a PDF (extension + magic bytes)
    $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    $head = '';
    $fh = @fopen($f['tmp_name'], 'rb');
    if ($fh) { $head = (string)fread($fh, 5); fclose($fh); }
    if ($ext !== 'pdf' || substr($head, 0, 4) !== '%PDF') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'not_pdf']);
        exit;
    }
    if (!is_uploaded_file($f['tmp_name']) || !move_uploaded_file($f['tmp_name'], $slots[$slot])) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'move_failed']);
        exit;
    }
    @chmod($slots[$slot], 0644);
    echo json_encode(['ok' => true, 'size' => filesize($slots[$slot])]);
    exit;
}

// ---- About / portrait image upload ----
if ($action === 'upload_image' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'csrf']);
        exit;
    }
    if (empty($_FILES['file']) || ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'no_file']);
        exit;
    }
    $f = $_FILES['file'];
    if ($f['size'] > 8 * 1024 * 1024) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'too_large']);
        exit;
    }
    // Validate it's a real image and map to a safe extension
    $info = @getimagesize($f['tmp_name']);
    $extByType = [
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG  => 'png',
        IMAGETYPE_WEBP => 'webp',
        IMAGETYPE_GIF  => 'gif',
    ];
    if (!is_array($info) || !isset($extByType[$info[2]])) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'not_image']);
        exit;
    }
    $ext = $extByType[$info[2]];
    $assetsDir = __DIR__ . '/../assets';
    // Remove any previous about-photo.* so stale extensions don't linger
    foreach (glob($assetsDir . '/about-photo.*') ?: [] as $old) @unlink($old);
    $dest = $assetsDir . '/about-photo.' . $ext;
    if (!is_uploaded_file($f['tmp_name']) || !move_uploaded_file($f['tmp_name'], $dest)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'move_failed']);
        exit;
    }
    @chmod($dest, 0644);
    // Path is site-root relative + cache-bust token so the new image shows immediately
    echo json_encode(['ok' => true, 'path' => 'assets/about-photo.' . $ext . '?v=' . time()]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'bad_request']);
