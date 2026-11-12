<?php
/**
 * Tanı (diagnostics) — neyin çalışıp çalışmadığını gösterir.
 * Panele giriş yaptıktan SONRA ferattas.com.tr/admin/diag.php adresini aç.
 * Sorun çözülünce bu dosyayı SİL.
 */
require __DIR__ . '/bootstrap.php';
require_login();
header('Content-Type: text/plain; charset=utf-8');

$dataDir = __DIR__ . '/../data';
function yn($b) { return $b ? 'EVET ✅' : 'HAYIR ❌'; }

echo "=== TANI RAPORU ===\n\n";
echo "PHP sürümü: " . PHP_VERSION . "\n\n";

echo "--- data/ klasörü ---\n";
echo "var mı: " . yn(is_dir($dataDir)) . "\n";
echo "yazılabilir mi: " . yn(is_writable($dataDir)) . "\n";
$test = $dataDir . '/.writetest_' . uniqid();
$wrote = @file_put_contents($test, 'x');
echo "gerçek yazma testi: " . yn($wrote !== false) . "\n";
if ($wrote !== false) @unlink($test);

echo "\n--- Ayarlar (.settings.php) ---\n";
$sf = $dataDir . '/.settings.php';
echo "dosya var mı: " . yn(is_file($sf)) . "\n";
$s = is_file($sf) ? (@include $sf) : [];
if (!is_array($s)) $s = [];
echo "contactEmail: " . ($s['contactEmail'] ?? '(YOK)') . "\n";
echo "smtpHost: " . ($s['smtpHost'] ?? '(YOK)') . "  port: " . ($s['smtpPort'] ?? '(YOK)') . "\n";
echo "smtp şifresi kayıtlı mı: " . yn(!empty($s['smtpPass'])) . "\n";

echo "\n--- Mesajlar (.messages.php) ---\n";
$mf = $dataDir . '/.messages.php';
$m = is_file($mf) ? (@include $mf) : [];
echo "dosya var mı: " . yn(is_file($mf)) . "\n";
echo "kayıt sayısı: " . (is_array($m) ? count($m) : '(okunamadı)') . "\n";

echo "\n--- PHP yetenekleri ---\n";
echo "openssl: " . yn(extension_loaded('openssl')) . "\n";
echo "stream_socket_client: " . yn(function_exists('stream_socket_client')) . "\n";
echo "allow_url_fopen: " . yn((bool)ini_get('allow_url_fopen')) . "\n";

echo "\n--- SMTP bağlantı testi ---\n";
$host = $s['smtpHost'] ?? 'smtp.turkticaret.net';
$port = (int)($s['smtpPort'] ?? 465);
$transport = ($port === 465) ? 'ssl://' : 'tcp://';
$ctx = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
$fp = @stream_socket_client($transport . $host . ':' . $port, $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $ctx);
echo "{$host}:{$port} bağlantı: " . yn((bool)$fp);
if (!$fp) echo "  (hata: {$errstr})";
echo "\n";
if ($fp) {
    $greet = fgets($fp, 256);
    echo "sunucu yanıtı: " . trim((string)$greet) . "\n";
    fclose($fp);
}

echo "\n=== BİTTİ — bu çıktının tamamını Ferat'a (panel sohbeti) yapıştır ===\n";
