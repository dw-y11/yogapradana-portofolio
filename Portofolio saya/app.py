from flask import Flask, render_template, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

# ============================================================
# KONFIGURASI EMAIL - Ikuti langkah berikut:
# 1. Buka https://myaccount.google.com/security
# 2. Aktifkan "Verifikasi 2 Langkah" (2-Step Verification)
# 3. Buka https://myaccount.google.com/apppasswords
# 4. Buat App Password baru, copy password 16 karakter
# 5. Paste password tersebut di EMAIL_APP_PASSWORD di bawah
# ============================================================
EMAIL_ADDRESS = "dwyogapradana@gmail.com"
EMAIL_APP_PASSWORD = "vyxg fngc kepr uofw"  # Ganti dengan App Password Gmail Anda

# ============================================================
# DATA PORTOFOLIO - Ubah data di bawah ini sesuai informasi Anda
# ============================================================

profile = {
    "name": "Yoga Pradana",
    "photo": "Foto-Yoga.jpg.jpeg",  # Nama file foto di folder static/img/
    "role": "Web Developer & Software Engineer",
    "tagline": "Membangun solusi digital yang inovatif dan berdampak",
    "bio": (
        "Saya adalah seorang developer yang passionate dalam menciptakan "
        "aplikasi web modern dan user-friendly. Dengan pengalaman di berbagai "
        "teknologi, saya selalu berusaha memberikan solusi terbaik untuk setiap "
        "proyek yang saya kerjakan."
    ),
    "email": "dwyogapradana@gmail.com",
    "phone": "+62 822-9352-4552",
    "location": "Indonesia",
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/dw-yoga-pradana-41a69627b/",
    "instagram": "https://instagram.com/dewayogaaa_",
}

skills = [
    {"name": "Python", "level": 90, "icon": "🐍"},
    {"name": "HTML & CSS", "level": 85, "icon": "🎨"},
    {"name": "JavaScript", "level": 80, "icon": "⚡"},
    {"name": "Flask", "level": 85, "icon": "🌶️"},
    {"name": "Laravel / PHP", "level": 75, "icon": "🐘"},
    {"name": "Database (MySQL)", "level": 80, "icon": "🗄️"},
    {"name": "Git & GitHub", "level": 85, "icon": "🔀"},
    {"name": "UI/UX Design", "level": 70, "icon": "✏️"},
]

projects = [
    {
        "title": "Virtual Tour Website",
        "description": "Website virtual tour interaktif untuk eksplorasi tempat wisata secara online dengan tampilan 360°.",
        "tech": ["Laravel", "JavaScript", "Three.js"],
        "link": "#",
        "image": None,
    },
    {
        "title": "E-Commerce Platform",
        "description": "Platform e-commerce lengkap dengan fitur keranjang belanja, pembayaran, dan manajemen produk.",
        "tech": ["Python", "Flask", "MySQL"],
        "link": "#",
        "image": None,
    },
    {
        "title": "Task Management App",
        "description": "Aplikasi manajemen tugas dengan fitur drag & drop, deadline reminder, dan kolaborasi tim.",
        "tech": ["HTML", "CSS", "JavaScript"],
        "link": "#",
        "image": None,
    },
    {
        "title": "Portfolio Website",
        "description": "Website portofolio personal dengan desain modern, animasi smooth, dan responsif.",
        "tech": ["Python", "Flask", "CSS"],
        "link": "#",
        "image": None,
    },
]

education = [
    {
        "degree": "Sarjana Komputer (S.Kom)",
        "school": "ITB Stikom Bali",
        "year": "2022 - 2026",
        "description": "Jurusan Teknl",
    },
]

experience = [
    {
        "role": "Web Developer",
        "company": "Perusahaan / Freelance",
        "year": "2024 - Sekarang",
        "description": "Mengembangkan aplikasi web menggunakan berbagai framework modern.",
    },
]


@app.route("/")
def index():
    return render_template(
        "index.html",
        profile=profile,
        skills=skills,
        projects=projects,
        education=education,
        experience=experience,
    )


@app.route("/send-message", methods=["POST"])
def send_message():
    try:
        data = request.get_json()
        name = data.get("name", "")
        email = data.get("email", "")
        subject = data.get("subject", "")
        message = data.get("message", "")

        if not all([name, email, subject, message]):
            return jsonify({"success": False, "error": "Semua field harus diisi"}), 400

        # Buat email
        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = EMAIL_ADDRESS
        msg["Reply-To"] = email
        msg["Subject"] = f"[Portfolio] {subject}"

        body = f"""Pesan baru dari Portfolio Website:

Nama    : {name}
Email   : {email}
Subjek  : {subject}

Pesan:
{message}
"""
        msg.attach(MIMEText(body, "plain"))

        # Kirim email via Gmail SMTP
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
            server.send_message(msg)

        return jsonify({"success": True, "message": "Pesan berhasil dikirim!"})

    except smtplib.SMTPAuthenticationError as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Gagal autentikasi email. Periksa App Password Anda."}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Gagal mengirim: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)

