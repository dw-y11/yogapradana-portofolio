/* ============================================================
   PORTFOLIO - MAIN JAVASCRIPT
   Interactivity, animations, and dynamic effects
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- NAVBAR SCROLL ----------
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.panel');

    window.addEventListener('scroll', () => {
        // Add scrolled class to navbar when scrolling down
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Active link highlighting (Scroll Spy)
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (window.scrollY >= top) {
                current = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ---------- MOBILE MENU (Hamburger) ----------
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('open');
        });

        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });
    }

    // ---------- TYPING EFFECT ----------
    const typedEl = document.getElementById('typed-text');
    if (typedEl) {
        const strings = window.TYPED_STRINGS || ['Developer'];
        let stringIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;

        function typeEffect() {
            const currentString = strings[stringIndex];

            if (isDeleting) {
                typedEl.textContent = currentString.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                typedEl.textContent = currentString.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            if (!isDeleting && charIndex === currentString.length) {
                typingSpeed = 2000; // Pause at end of text
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                stringIndex = (stringIndex + 1) % strings.length;
                typingSpeed = 500; // Pause before starting new text
            }

            setTimeout(typeEffect, typingSpeed);
        }

        typeEffect();
    }

    // ---------- SCROLL ANIMATIONS (Fade In) ----------
    const animElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger delay for elements appearing together
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animElements.forEach(el => observer.observe(el));

    // ---------- SKILL BAR ANIMATION ----------
    const skillBars = document.querySelectorAll('.skill-editorial-progress');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));

    // ---------- COUNTER ANIMATION ----------
    const counters = document.querySelectorAll('.stat-num');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                let count = 0;
                const increment = Math.ceil(target / 40);
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        count = target;
                        clearInterval(timer);
                    }
                    entry.target.textContent = count;
                }, 40);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ---------- CONTACT FORM SUBMISSION ----------
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-primary');
            const originalHTML = btn.innerHTML;

            // Loading state
            btn.innerHTML = '<span>Mengirim...</span>';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            try {
                const response = await fetch('/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: form.querySelector('#name').value,
                        email: form.querySelector('#email').value,
                        subject: form.querySelector('#subject').value,
                        message: form.querySelector('#message').value,
                    })
                });

                const result = await response.json();

                if (result.success) {
                    btn.innerHTML = '<span>Terkirim! ✓</span>';
                    btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
                    btn.style.boxShadow = '0 4px 20px rgba(74, 222, 128, 0.4)';
                    btn.style.opacity = '1';
                    form.reset();
                } else {
                    btn.innerHTML = '<span>Gagal ✗</span>';
                    btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    btn.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.4)';
                    btn.style.opacity = '1';
                    alert('Error: ' + result.error);
                }
            } catch (err) {
                btn.innerHTML = '<span>Error ✗</span>';
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                btn.style.opacity = '1';
                console.error('Network error:', err);
                alert('Gagal menghubungi server. Periksa koneksi internet Anda.');
            }

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.boxShadow = '';
                btn.style.opacity = '';
                btn.disabled = false;
            }, 3000);
        });
    }

    // ---------- SMOOTH SCROLL ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});
