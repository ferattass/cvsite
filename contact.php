<?php
/**
 * İletişim formu işleyici — SMTP'li.
 * -------------------------------------------------
 * Türk Ticaret (ve birçok paylaşımlı hosting) PHP mail() desteklemez; bu yüzden
 * mesaj, panelden (Ayarlar) girilen webmail hesabıyla SMTP üzerinden gönderilir.
 * Mesaj ayrıca her durumda panele kaydedilir (data/.messages.php → "Mesajlar").
 *
 * Ayarlar (panel → Ayarlar):
 *   contactEmail : gönderen = alıcı hesap (örn. info@ferattas.com.tr)
 *   smtpPass     : o hesabın e-posta şifresi
 *   smtpHost     : varsayılan smtp.turkticaret.net
 *   smtpPort     : varsayılan 465 (SSL) — 587 de (STARTTLS) desteklenir
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ---- Ayarları yükle ----
$settingsFile = __DIR__ . '/data/.settings.php';
$cfg = is_file($settingsFile) ? (@include $settingsFile) : [];
if (!is_array($cfg)) $cfg = [];
$to       = (!empty($cfg['contactEmail']) && filter_var($cfg['contactEmail'], FILTER_VALIDATE_EMAIL)) ? (string)$cfg['contactEmail'] : 'ferattas2763@gmail.com';
$smtpHost = !empty($cfg['smtpHost']) ? (string)$cfg['smtpHost'] : 'smtp.turkticaret.net';
$smtpPort = !empty($cfg['smtpPort']) ? (int)$cfg['smtpPort'] : 465;
$smtpPass = isset($cfg['smtpPass']) ? (string)$cfg['smtpPass'] : '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok' => false, 'error' => 'method']); exit; }

// --- Honeypot ---
if (trim((string)($_POST['website'] ?? '')) !== '') { echo json_encode(['ok' => true]); exit; }

// --- IP bazlı hız sınırı: 10 dk'da en fazla 5 ---
$throttleFile = __DIR__ . '/data/.contact_throttle.php';
$ip  = (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
$now = time();
$store = is_file($throttleFile) ? (@include $throttleFile) : [];
if (!is_array($store)) $store = [];
$rec = $store[$ip] ?? ['n' => 0, 'win' => $now];
if ($now - ($rec['win'] ?? $now) > 600) $rec = ['n' => 0, 'win' => $now];
if (($rec['n'] ?? 0) >= 5) { http_response_code(429); echo json_encode(['ok' => false, 'error' => 'rate']); exit; }

$name    = trim((string)($_POST['name'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422); echo json_encode(['ok' => false, 'error' => 'validation']); exit;
}
if (mb_strlen($name) > 120 || mb_strlen($subject) > 160 || mb_strlen($message) > 5000) {
    http_response_code(422); echo json_encode(['ok' => false, 'error' => 'too_long']); exit;
}

// CRLF temizliği (header injection koruması)
$clean = fn(string $s): string => str_replace(["\r", "\n"], '', $s);
$name = $clean($name); $subject = $clean($subject);

$mailSubject = $subject !== '' ? "[İletişim] $subject" : "[İletişim] $name tarafından yeni mesaj";
$htmlBody = build_html_email($name, $email, $subject, $message);

// ---- Mesajı panele kaydet (mail gitse de gitmese de) ----
$msgFile = __DIR__ . '/data/.messages.php';
$list = is_file($msgFile) ? (@include $msgFile) : [];
if (!is_array($list)) $list = [];
$list[] = [
    'id' => uniqid('m', true), 'name' => $name, 'email' => $email,
    'subject' => $subject, 'message' => $message, 'date' => date('c'), 'ip' => $ip, 'read' => false,
];
if (count($list) > 500) $list = array_slice($list, -500);
$saved = @file_put_contents($msgFile, "<?php\nreturn " . var_export($list, true) . ";\n", LOCK_EX) !== false;

// ---- Gönder ----
$sent = false; $sendErr = null;
if ($smtpPass !== '') {
    $sent = smtp_send([
        'host' => $smtpHost, 'port' => $smtpPort, 'user' => $to, 'pass' => $smtpPass, 'from' => $to,
    ], $to, $mailSubject, $htmlBody, $email, $sendErr);
} else {
    // mail() yedeği (Türk Ticaret'te çalışmaz; başka host için)
    $h  = "From: =?UTF-8?B?" . base64_encode('Ferat Taş — Site') . "?= <{$to}>\r\n";
    $h .= "Reply-To: {$email}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n";
    $sent = @mail($to, '=?UTF-8?B?' . base64_encode($mailSubject) . '?=', $htmlBody, $h);
}

// hız sınırı sayacı
$rec['n'] = (int)($rec['n'] ?? 0) + 1;
$store[$ip] = $rec;
foreach ($store as $k => $v) { if ($now - ($v['win'] ?? 0) > 3600) unset($store[$k]); }
@file_put_contents($throttleFile, "<?php\nreturn " . var_export($store, true) . ";\n", LOCK_EX);

// Mesaj panele kaydedildiyse VEYA mail gittiyse başarı (ziyaretçi mailto'ya düşmesin)
if ($saved || $sent) {
    echo json_encode(['ok' => true, 'sent' => $sent]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'send']);
}

/* ============================================================
   Şık HTML e-posta şablonu (e-posta istemcileri için inline stil + tablo)
   ============================================================ */
function build_html_email(string $name, string $email, string $subject, string $message): string {
    $e = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
    $row = function (string $label, string $valHtml): string {
        return '<tr><td style="padding:9px 0;border-bottom:1px solid #f0f0f3;">'
            . '<span style="display:inline-block;width:96px;color:#6b6b76;font-size:13px;vertical-align:top;">' . $label . '</span>'
            . '<span style="font-size:15px;font-weight:600;color:#15151a;">' . $valHtml . '</span></td></tr>';
    };
    $msgHtml = nl2br($e($message));
    $subj    = $subject !== '' ? $e($subject) : '—';
    $date    = date('d.m.Y H:i');
    $reply   = 'mailto:' . $e($email) . '?subject=' . rawurlencode('Re: ' . $subject);

    return '<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
        . '<body style="margin:0;padding:0;background:#f4f4f7;font-family:\'Segoe UI\',Roboto,Arial,sans-serif;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:30px 12px;"><tr><td align="center">'
        . '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 34px rgba(40,30,90,.10);">'
        . '<tr><td style="background:linear-gradient(120deg,#4f46e5,#7c3aed);padding:26px 30px;">'
        .   '<table role="presentation" cellpadding="0" cellspacing="0"><tr>'
        .     '<td style="width:46px;"><div style="width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.18);color:#fff;font-weight:700;font-size:16px;text-align:center;line-height:42px;">FT</div></td>'
        .     '<td style="padding-left:14px;"><div style="color:#fff;font-size:12px;letter-spacing:.1em;text-transform:uppercase;opacity:.85;">ferattas.com.tr</div>'
        .       '<div style="color:#fff;font-size:21px;font-weight:700;margin-top:3px;">Yeni İletişim Mesajı</div></td>'
        .   '</tr></table>'
        . '</td></tr>'
        . '<tr><td style="padding:26px 30px;">'
        .   '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        .     $row('Ad Soyad', $e($name))
        .     $row('E-posta', '<a href="mailto:' . $e($email) . '" style="color:#4f46e5;text-decoration:none;">' . $e($email) . '</a>')
        .     $row('Konu', $subj)
        .     $row('Tarih', $date)
        .   '</table>'
        .   '<div style="margin-top:20px;font-size:12px;color:#6b6b76;text-transform:uppercase;letter-spacing:.05em;font-weight:700;">Mesaj</div>'
        .   '<div style="margin-top:8px;padding:16px 18px;background:#f7f7fa;border:1px solid #e7e7ec;border-radius:12px;font-size:15px;line-height:1.65;color:#23232b;">' . $msgHtml . '</div>'
        .   '<div style="margin-top:24px;"><a href="' . $reply . '" style="display:inline-block;background:linear-gradient(120deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:600;font-size:14px;">↩ Yanıtla</a></div>'
        . '</td></tr>'
        . '<tr><td style="padding:16px 30px;border-top:1px solid #eeeef2;color:#9a9aa5;font-size:12px;">Bu mesaj <strong style="color:#6b6b76;">ferattas.com.tr</strong> iletişim formundan gönderildi.</td></tr>'
        . '</table></td></tr></table></body></html>';
}

/* ============================================================
   Minimal SMTP istemcisi (bağımlılık yok). 465=SSL, 587=STARTTLS.
   ============================================================ */
function smtp_send(array $c, string $to, string $subject, string $body, string $replyTo, ?string &$err = null): bool {
    $host = $c['host']; $port = (int)$c['port']; $user = $c['user']; $pass = $c['pass']; $from = $c['from'];
    $transport = ($port === 465) ? 'ssl://' : 'tcp://';
    $ctx = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
    $fp = @stream_socket_client($transport . $host . ':' . $port, $errno, $errstr, 20, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) { $err = "connect: $errstr"; return false; }
    stream_set_timeout($fp, 20);

    $read = function () use ($fp) {
        $data = '';
        while (($line = fgets($fp, 600)) !== false) { $data .= $line; if (strlen($line) < 4 || $line[3] === ' ') break; }
        return $data;
    };
    $cmd = function ($c) use ($fp, $read) { fwrite($fp, $c . "\r\n"); return $read(); };
    $ok2 = fn($r) => $r !== '' && ($r[0] === '2' || $r[0] === '3');

    $read(); // greeting
    $ehloHost = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $cmd("EHLO $ehloHost");

    if ($port === 587) {
        if (!$ok2($cmd("STARTTLS"))) { $err = 'starttls'; fclose($fp); return false; }
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT)) { $err = 'tls'; fclose($fp); return false; }
        $cmd("EHLO $ehloHost");
    }

    if (substr($cmd("AUTH LOGIN"), 0, 3) !== '334') { $err = 'auth'; fclose($fp); return false; }
    if (substr($cmd(base64_encode($user)), 0, 3) !== '334') { $err = 'user'; fclose($fp); return false; }
    if (substr($cmd(base64_encode($pass)), 0, 3) !== '235') { $err = 'pass'; fclose($fp); return false; }
    if (!$ok2($cmd("MAIL FROM:<$from>"))) { $err = 'from'; fclose($fp); return false; }
    if (!$ok2($cmd("RCPT TO:<$to>"))) { $err = 'rcpt'; fclose($fp); return false; }
    if (substr($cmd("DATA"), 0, 3) !== '354') { $err = 'data'; fclose($fp); return false; }

    $headers  = "From: =?UTF-8?B?" . base64_encode('Ferat Taş — Site') . "?= <$from>\r\n";
    $headers .= "To: <$to>\r\n";
    $headers .= "Reply-To: <$replyTo>\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $headers .= "Date: " . date('r') . "\r\n";
    $headers .= "MIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n";
    $dotStuffed = preg_replace('/^\./m', '..', $body);
    $r = $cmd($headers . "\r\n" . $dotStuffed . "\r\n.");
    if (!$ok2($r)) { $err = 'send'; fclose($fp); return false; }
    @fwrite($fp, "QUIT\r\n"); fclose($fp);
    return true;
}
