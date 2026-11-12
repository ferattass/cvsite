<?php
/**
 * Admin bootstrap — session, auth helpers, CSRF, security headers.
 * Shared by index.php and api.php.
 */
declare(strict_types=1);

// ---- Security headers ----
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');

// ---- Hardened session ----
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'httponly' => true,
    'secure' => $secure,
    'samesite' => 'Strict',
]);
session_name('cvadmin');
session_start();

// ---- Paths ----
const AUTH_FILE    = __DIR__ . '/.auth.php';                 // stores password hash (not served as text)
const CONTENT_FILE = __DIR__ . '/../data/content.json';      // site reads this
const BACKUP_DIR   = __DIR__ . '/../data/backups';

// ---- Users (multi-user auth) ----
const DEFAULT_ADMIN_EMAIL = 'ferattas2763@gmail.com';
const DEFAULT_ADMIN_PASS  = 'Ferattass55!';

function users_read(): array {
    if (!is_file(AUTH_FILE)) return [];
    $data = @include AUTH_FILE;
    return (is_array($data) && isset($data['users']) && is_array($data['users'])) ? $data['users'] : [];
}
function users_write(array $users): bool {
    $php = "<?php\n// Auto-generated. Do not edit by hand.\nreturn " . var_export(['users' => array_values($users)], true) . ";\n";
    return file_put_contents(AUTH_FILE, $php, LOCK_EX) !== false;
}
function ensure_default_user(): void {
    if (!users_read()) {
        users_write([['email' => DEFAULT_ADMIN_EMAIL, 'hash' => password_hash(DEFAULT_ADMIN_PASS, PASSWORD_DEFAULT)]]);
    }
}
function user_find(string $email): ?array {
    $email = strtolower(trim($email));
    foreach (users_read() as $u) if (strtolower((string)($u['email'] ?? '')) === $email) return $u;
    return null;
}
function auth_verify(string $email, string $password): bool {
    $u = user_find($email);
    // run a verify even when not found to reduce timing differences
    $hash = $u['hash'] ?? '$2y$10$abcdefghijklmnopqrstuv0123456789012345678901234';
    $ok = password_verify($password, (string)$hash);
    return $u !== null && $ok;
}
function users_list_emails(): array {
    return array_map(fn($u) => (string)($u['email'] ?? ''), users_read());
}
function users_add(string $email, string $password): array {
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return ['ok' => false, 'error' => 'bad_email'];
    if (strlen($password) < 8)                       return ['ok' => false, 'error' => 'weak_password'];
    if (user_find($email))                           return ['ok' => false, 'error' => 'exists'];
    $users = users_read();
    $users[] = ['email' => $email, 'hash' => password_hash($password, PASSWORD_DEFAULT)];
    return users_write($users) ? ['ok' => true] : ['ok' => false, 'error' => 'write_failed'];
}
function users_remove(string $email): array {
    $email = strtolower(trim($email));
    $users = users_read();
    if (count($users) <= 1) return ['ok' => false, 'error' => 'last_user'];
    $users = array_values(array_filter($users, fn($u) => strtolower((string)($u['email'] ?? '')) !== $email));
    return users_write($users) ? ['ok' => true] : ['ok' => false, 'error' => 'write_failed'];
}
function users_set_password(string $email, string $password): array {
    if (strlen($password) < 8) return ['ok' => false, 'error' => 'weak_password'];
    $email = strtolower(trim($email));
    $users = users_read(); $found = false;
    foreach ($users as &$u) {
        if (strtolower((string)($u['email'] ?? '')) === $email) { $u['hash'] = password_hash($password, PASSWORD_DEFAULT); $found = true; }
    }
    unset($u);
    if (!$found) return ['ok' => false, 'error' => 'not_found'];
    return users_write($users) ? ['ok' => true] : ['ok' => false, 'error' => 'write_failed'];
}

function is_logged_in(): bool { return !empty($_SESSION['admin_ok']); }
function current_admin(): string { return (string)($_SESSION['admin_email'] ?? ''); }

function require_login(): void {
    if (!is_logged_in()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'unauthorized']);
        exit;
    }
}

// ---- CSRF ----
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function csrf_check(?string $t): bool {
    return is_string($t) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $t);
}

// ---- Brute-force throttle (IP-based, cookie-independent) ----
const THROTTLE_FILE = __DIR__ . '/../data/.login_throttle.php'; // .php => not served as text

function client_ip(): string {
    // Only trust forwarded headers if explicitly behind a known proxy; default to REMOTE_ADDR.
    return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}
function throttle_read(): array {
    if (!is_file(THROTTLE_FILE)) return [];
    $d = @include THROTTLE_FILE;
    return is_array($d) ? $d : [];
}
function throttle_write(array $data): void {
    $php = "<?php\nreturn " . var_export($data, true) . ";\n";
    @file_put_contents(THROTTLE_FILE, $php, LOCK_EX);
}
function login_throttle(): void {
    $now = time(); $ip = client_ip();
    $data = throttle_read();
    $rec = $data[$ip] ?? null;
    if ($rec && ($rec['until'] ?? 0) > $now) {
        $wait = $rec['until'] - $now;
        http_response_code(429);
        header('Retry-After: ' . $wait);
        exit('Çok fazla deneme. ' . $wait . ' saniye sonra tekrar deneyin.');
    }
}
function login_failed(): void {
    $now = time(); $ip = client_ip();
    $data = throttle_read();
    $rec = $data[$ip] ?? ['n' => 0, 'until' => 0, 'win' => $now];
    if ($now - ($rec['win'] ?? $now) > 900) $rec = ['n' => 0, 'until' => 0, 'win' => $now]; // 15m window
    $rec['n']++;
    if ($rec['n'] >= 8) { $rec['until'] = $now + 300; $rec['n'] = 0; $rec['win'] = $now; } // lock 5m
    $data[$ip] = $rec;
    // prune stale entries
    foreach ($data as $k => $v) {
        if (($now - ($v['win'] ?? 0) > 3600) && ($v['until'] ?? 0) < $now) unset($data[$k]);
    }
    throttle_write($data);
    usleep(350000); // additional per-request slowdown
}
function login_ok(string $email): void {
    $ip = client_ip();
    $data = throttle_read();
    if (isset($data[$ip])) { unset($data[$ip]); throttle_write($data); }
    session_regenerate_id(true);
    $_SESSION['admin_ok'] = true;
    $_SESSION['admin_email'] = strtolower(trim($email));
}

// Seed the default admin user on first run (so the panel works out of the box)
ensure_default_user();
