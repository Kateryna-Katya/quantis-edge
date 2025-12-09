document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. INIT LIBRARIES & UTILS
    // =========================================
    // Инициализация иконок
    lucide.createIcons();
    
    // Регистрация плагина анимации
    gsap.registerPlugin(ScrollTrigger);

    // --- Lenis Smooth Scroll (Плавный скролл) ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
        smoothTouch: false
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);


    // =========================================
    // 2. HERO ANIMATION (Анимация первого экрана)
    // =========================================
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Проверка загрузки SplitType
        let heroTitleWords = null;
        try {
            const heroTitle = new SplitType('.hero__title', { types: 'lines, words' });
            heroTitleWords = heroTitle.words;
        } catch (e) {
            console.warn('SplitType not loaded, fallback to opacity');
            gsap.set('.hero__title', { opacity: 1 });
        }

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.to('.hero__badge', { y: 0, opacity: 1, duration: 0.8, delay: 0.2 })
          .to('.hero__title', { opacity: 1, duration: 0.1 }, "-=0.5");
        
        if (heroTitleWords) {
            tl.from(heroTitleWords, { 
                y: 50, opacity: 0, rotation: 3, duration: 1, stagger: 0.04 
            }, "-=0.5");
        }

        tl.to('.hero__subtitle', { y: 0, opacity: 1, duration: 0.8 }, "-=0.8")
          .to('.hero__actions', { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
          .to('.hero__visual', { opacity: 1, duration: 1.5, scale: 1 }, "-=1");
    }


    // =========================================
    // 3. SCROLL ANIMATIONS (Анимация при скролле)
    // =========================================
    
    // Анимация появления карточек и текста
    const fadeElements = document.querySelectorAll('.card, .section-title, .section-desc, .about__content');
    
    fadeElements.forEach(el => {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            {
                y: 0, 
                opacity: 1, 
                duration: 0.8, 
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", 
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Анимация шагов (Innovation)
    gsap.from('.step', {
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.steps',
            start: "top 80%"
        }
    });


    // =========================================
    // 4. MOBILE MENU (Мобильное меню)
    // =========================================
    const burgerBtn = document.querySelector('.header__burger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuLinks = document.querySelectorAll('.mobile-menu__link');
    let isMenuOpen = false;

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        mobileMenu.classList.toggle('is-active');
        const iconName = isMenuOpen ? 'x' : 'menu';
        burgerBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        lucide.createIcons();
        
        if (isMenuOpen) {
            lenis.stop();
            document.body.style.overflow = 'hidden';
        } else {
            lenis.start();
            document.body.style.overflow = '';
        }
    };

    if (burgerBtn) burgerBtn.addEventListener('click', toggleMenu);
    menuLinks.forEach(link => link.addEventListener('click', () => { if(isMenuOpen) toggleMenu(); }));


    // =========================================
    // 5. COOKIE POPUP
    // =========================================
    const cookiePopup = document.getElementById('cookiePopup');
    const cookieAcceptBtn = document.getElementById('cookieAccept');

    // Проверка localStorage
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            if(cookiePopup) cookiePopup.classList.add('show');
        }, 2000); 
    }

    if (cookieAcceptBtn) {
        cookieAcceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookiePopup.classList.remove('show');
        });
    }


    // =========================================
    // 6. CONTACT FORM LOGIC (FIXED)
    // =========================================
    const form = document.getElementById('contactForm');
    const captchaQuestion = document.getElementById('captchaQuestion');
    const captchaAnswerInput = document.getElementById('captchaAnswer');
    
    // --- Math Captcha Generation ---
    let captchaResult = 0;
    const initCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaResult = num1 + num2;
        if(captchaQuestion) captchaQuestion.textContent = `${num1} + ${num2}`;
    };
    
    if(captchaQuestion) initCaptcha();

    // --- Phone Input Restriction ---
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9+ ]/g, '');
        });
    }

    // --- Form Submit ---
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // Simple Validation Helpers
            const setError = (id, show) => {
                const el = document.getElementById(id);
                if (el) {
                    if(show) el.classList.add('error');
                    else el.classList.remove('error');
                }
            };

            // 1. Name
            const nameEl = document.getElementById('name');
            if (nameEl && nameEl.value.trim().length < 2) { setError('name', true); isValid = false; } 
            else setError('name', false);

            // 2. Email
            const emailEl = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailEl && !emailRegex.test(emailEl.value.trim())) { setError('email', true); isValid = false; }
            else setError('email', false);

            // 3. Phone
            const phoneEl = document.getElementById('phone');
            if (phoneEl && phoneEl.value.trim().length < 8) { setError('phone', true); isValid = false; }
            else setError('phone', false);

            // 4. Captcha
            if (captchaAnswerInput && parseInt(captchaAnswerInput.value) !== captchaResult) {
                setError('captchaAnswer', true); isValid = false;
            } else {
                setError('captchaAnswer', false);
            }

            // 5. Checkbox
            const consentEl = document.getElementById('consent');
            if (consentEl && !consentEl.checked) isValid = false;

            if (isValid) {
                // Имитация отправки
                const btn = form.querySelector('button[type="submit"]');
                if(btn) {
                    btn.textContent = 'Отправка...';
                    btn.disabled = true;
                }

                setTimeout(() => {
                    // ИСПРАВЛЕНИЕ: Скрываем все элементы формы КРОМЕ сообщения об успехе
                    // Находим все элементы формы, которые не являются сообщением об успехе
                    const formChildren = Array.from(form.children).filter(child => child.id !== 'formSuccess');
                    const successMsg = document.getElementById('formSuccess');

                    // 1. Плавно скрываем поля ввода
                    gsap.to(formChildren, {
                        opacity: 0,
                        y: -20,
                        duration: 0.5,
                        stagger: 0.05,
                        onComplete: () => {
                            // 2. Убираем поля из потока (display: none)
                            formChildren.forEach(child => child.style.display = 'none');
                            
                            // 3. Показываем сообщение об успехе
                            if(successMsg) {
                                successMsg.style.display = 'block';
                                
                                // 4. Анимируем появление сообщения
                                gsap.fromTo(successMsg, 
                                    { opacity: 0, y: 20, scale: 0.9 }, 
                                    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
                                );
                            }
                        }
                    });

                }, 1500);
            }
        });
    }
});