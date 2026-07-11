<?php
// Set response headers to JSON
header('Content-Type: application/json; charset=utf-8');

// Configuration
define('EMAIL_ADDRESS', 'dwyogapradana@gmail.com');
define('EMAIL_APP_PASSWORD', 'vyxg fngc kepr uofw');
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 465); // SSL port for Gmail

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Metode request tidak diizinkan. Harap gunakan POST.']);
    exit;
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    // Fallback to standard POST fields
    $data = $_POST;
}

$name = isset($data['name']) ? trim($data['name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$subject = isset($data['subject']) ? trim($data['subject']) : '';
$message = isset($data['message']) ? trim($data['message']) : '';

if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Semua field harus diisi.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Alamat email tidak valid.']);
    exit;
}

try {
    $mailBody = "Pesan baru dari Portfolio Website:\n\n";
    $mailBody .= "Nama    : " . $name . "\n";
    $mailBody .= "Email   : " . $email . "\n";
    $mailBody .= "Subjek  : " . $subject . "\n\n";
    $mailBody .= "Pesan:\n" . $message . "\n";

    send_smtp_email(
        EMAIL_ADDRESS,
        "[Portfolio] " . $subject,
        $mailBody,
        $email,
        $name,
        SMTP_HOST,
        SMTP_PORT,
        EMAIL_ADDRESS,
        EMAIL_APP_PASSWORD
    );

    echo json_encode(['success' => true, 'message' => 'Pesan berhasil dikirim!']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Gagal mengirim pesan: ' . $e->getMessage()]);
}

/**
 * Send email using native socket SMTP over SSL
 */
function send_smtp_email($to, $subject, $message, $reply_to, $reply_name, $host, $port, $username, $password) {
    // Open SSL socket connection
    $socket = @fsockopen("ssl://" . $host, $port, $errno, $errstr, 15);
    if (!$socket) {
        throw new Exception("Koneksi ke server SMTP gagal: $errstr ($errno)");
    }

    // Helper helper to read socket response
    $read_socket = function($socket, $expected_code) {
        $response = "";
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            if (substr($line, 3, 1) === " ") {
                break;
            }
        }
        $code = substr($response, 0, 3);
        if ($code !== $expected_code) {
            throw new Exception("Error SMTP (Kode Diharapkan: $expected_code, Diterima: " . trim($response) . ")");
        }
        return $response;
    };

    try {
        $read_socket($socket, "220");

        $ehloHost = isset($_SERVER['SERVER_NAME']) && !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost';
        fwrite($socket, "EHLO " . $ehloHost . "\r\n");
        $read_socket($socket, "250");

        fwrite($socket, "AUTH LOGIN\r\n");
        $read_socket($socket, "334");

        fwrite($socket, base64_encode($username) . "\r\n");
        $read_socket($socket, "334");

        fwrite($socket, base64_encode($password) . "\r\n");
        $read_socket($socket, "235");

        fwrite($socket, "MAIL FROM: <$username>\r\n");
        $read_socket($socket, "250");

        fwrite($socket, "RCPT TO: <$to>\r\n");
        $read_socket($socket, "250");

        fwrite($socket, "DATA\r\n");
        $read_socket($socket, "354");

        // Format headers properly with UTF-8 support
        $headers = [
            "MIME-Version: 1.0",
            "Content-Type: text/plain; charset=UTF-8",
            "From: =?UTF-8?B?" . base64_encode($reply_name) . "?= <$username>",
            "Reply-To: <$reply_to>",
            "To: <$to>",
            "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
            "Date: " . date('r'),
            "X-Mailer: PHP/" . phpversion()
        ];

        // Format message body, ensure linebreaks are \r\n and single dots at line start are escaped
        $message = str_replace("\r\n", "\n", $message);
        $message = str_replace("\r", "\n", $message);
        $lines = explode("\n", $message);
        foreach ($lines as &$line) {
            if (strpos($line, '.') === 0) {
                $line = '.' . $line;
            }
        }
        $message = implode("\r\n", $lines);

        $data = implode("\r\n", $headers) . "\r\n\r\n" . $message . "\r\n.\r\n";
        fwrite($socket, $data);
        $read_socket($socket, "250");

        fwrite($socket, "QUIT\r\n");
        fclose($socket);
        return true;
    } catch (Exception $e) {
        @fwrite($socket, "QUIT\r\n");
        fclose($socket);
        throw $e;
    }
}
