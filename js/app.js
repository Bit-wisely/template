document.addEventListener('DOMContentLoaded', () => {
    // ── Header colour transition ────────────────────────────────────────────
    // Stays white/transparent on the hero. Flips to dark frosted glass exactly
    // when the hero sticky section ends and the white content begins.
    const header   = document.querySelector('.site-header');
    const logoImg  = document.querySelector('.logo-img');
    const heroSec  = document.getElementById('hero');

    if (header && !header.classList.contains('static-header')) {
        const updateHeader = () => {
            // Trigger point: bottom of the hero section (its full scroll height)
            const heroBottom = heroSec ? heroSec.offsetTop + heroSec.offsetHeight : window.innerHeight;
            const past = window.scrollY >= heroBottom - window.innerHeight * 0.15;

            if (past) {
                header.classList.add('scrolled');
                if (logoImg) logoImg.classList.add('logo-dark');
            } else {
                header.classList.remove('scrolled');
                if (logoImg) logoImg.classList.remove('logo-dark');
            }
        };
        window.addEventListener('scroll', updateHeader, { passive: true });
        updateHeader();
    }

    // Mobile Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            header.classList.toggle('nav-open');
        });
    }

    // About Page Stats Count-Up Animation
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length > 0) {
        const countUp = (el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            let current = 0;
            const increment = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    el.textContent = current;
                }
            }, 30);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    // Mock Certificate Verification logic
    const verifyBtn = document.getElementById('cert-verify-btn');
    const certInput = document.getElementById('cert-id-input');
    const certResult = document.getElementById('cert-result');

    if (verifyBtn && certInput && certResult) {
        verifyBtn.addEventListener('click', () => {
            const query = certInput.value.trim().toUpperCase();
            certResult.innerHTML = ''; // Clear previous results

            if (!query) {
                certResult.innerHTML = `
                    <div class="cert-error-card">
                        Please enter a valid Registration Number.
                    </div>
                `;
                return;
            }

            const dummyCertDB = {
                'UCE26041': {
                    name: 'Aditya Verma',
                    certificates: [
                        { event: '2-Day Arduino Learning Workshop', role: 'Participant Pass', date: 'May 12, 2026', link: '#' },
                        { event: 'Algorithmic Coding Competition', role: 'Winner (1st Place)', date: 'June 15, 2026', link: '#' }
                    ]
                },
                'UCE26085': {
                    name: 'Neha Kumari',
                    certificates: [
                        { event: 'Free VR Experience Event', role: 'Volunteer Organizer', date: 'April 10, 2026', link: '#' }
                    ]
                }
            };

            if (dummyCertDB[query]) {
                const record = dummyCertDB[query];
                let certHtml = `
                    <div class="cert-success-card">
                        <h4 class="cert-success-title">✓ Student Record Found</h4>
                        <div class="cert-success-details" style="margin-bottom: 15px;">
                            <p><strong>Student Name:</strong> ${record.name}</p>
                            <p><strong>Registration No:</strong> ${query}</p>
                        </div>
                        <div class="cert-list" style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                `;

                record.certificates.forEach(cert => {
                    certHtml += `
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-accent); font-weight: 600; display: block;">${cert.event}</span>
                                <span style="font-size: 0.85rem; font-weight: 700; display: block; margin-top: 2px;">${cert.role}</span>
                                <span style="font-size: 0.7rem; color: var(--color-gray-500); display: block;">Awarded: ${cert.date}</span>
                            </div>
                        </div>
                    `;
                });

                certHtml += `</div></div>`;
                certResult.innerHTML = certHtml;
            } else {
                certResult.innerHTML = `
                    <div class="cert-error-card">
                        ✗ No certificate records found matching the registration number "${query}".
                    </div>
                `;
            }
        });
    }

    // Suggestion Form Submission
    const suggestionForm = document.getElementById('suggestion-form');
    const formFeedback = document.getElementById('form-feedback');

    if (suggestionForm && formFeedback) {
        suggestionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = document.getElementById('suggest-message').value.trim();
            
            if (message.length < 10) {
                formFeedback.style.color = '#ef4444';
                formFeedback.textContent = 'Please enter a suggestion with at least 10 characters.';
                return;
            }

            formFeedback.style.color = '#10b981';
            formFeedback.textContent = 'Thank you! Your suggestion has been successfully submitted.';
            suggestionForm.reset();
            
            setTimeout(() => {
                formFeedback.textContent = '';
            }, 5000);
        });
    }

    // ── Photo Wall — cursor-parting interaction (robuce.vercel.app style) ────
    const wall = document.getElementById('photowall');
    if (wall) {
        const photos = Array.from(wall.querySelectorAll('.pw-photo'));

        // Custom cursor dot
        const cursor = document.createElement('div');
        cursor.className = 'pw-cursor';
        wall.appendChild(cursor);

        // Cache each photo's centre (relative to the wall) on layout
        let centers = [];
        const measure = () => {
            const wr = wall.getBoundingClientRect();
            centers = photos.map(p => {
                const r = p.getBoundingClientRect();
                return {
                    el: p,
                    cx: r.left - wr.left + r.width / 2,
                    cy: r.top - wr.top + r.height / 2,
                    depth: parseFloat(p.dataset.depth) || 1.5
                };
            });
        };
        measure();
        window.addEventListener('resize', measure);

        let pointer = { x: -9999, y: -9999 };
        let active = false;
        let raf = null;

        const RADIUS = 260;   // px — how far the "push" reaches
        const PUSH   = 90;    // px — max displacement strength

        const render = () => {
            centers.forEach(({ el, cx, cy, depth }) => {
                const dx = cx - pointer.x;
                const dy = cy - pointer.y;
                const dist = Math.hypot(dx, dy);
                let tx = 0, ty = 0;
                if (active && dist < RADIUS) {
                    // Closer photos get pushed harder; falls off with distance
                    const force = (1 - dist / RADIUS) * PUSH;
                    const ang = Math.atan2(dy, dx);
                    tx = Math.cos(ang) * force * (depth / 1.5);
                    ty = Math.sin(ang) * force * (depth / 1.5);
                }
                el.style.setProperty('--tx', tx.toFixed(1) + 'px');
                el.style.setProperty('--ty', ty.toFixed(1) + 'px');
            });
            raf = null;
        };

        const requestRender = () => {
            if (!raf) raf = requestAnimationFrame(render);
        };

        wall.addEventListener('pointermove', (e) => {
            const wr = wall.getBoundingClientRect();
            pointer.x = e.clientX - wr.left;
            pointer.y = e.clientY - wr.top;
            cursor.style.transform = `translate(${pointer.x}px, ${pointer.y}px) translate(-50%, -50%)`;
            requestRender();
        });

        wall.addEventListener('pointerenter', () => {
            active = true;
            wall.classList.add('is-active');
        });

        wall.addEventListener('pointerleave', () => {
            active = false;
            wall.classList.remove('is-active');
            pointer = { x: -9999, y: -9999 };
            requestRender();
        });
    }
});
