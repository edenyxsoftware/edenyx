(function() {
    'use strict';

    let cameFromLink = false;

    window.addEventListener('load', function() {
        window.scrollTo(0, 0);
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.scrollTo(0, 0);
            init();
        });
    } else {
        window.scrollTo(0, 0);
        init();
    }

    function init() {
        setCurrentYear();
        setupServicesAnimation();
        setupSmoothScrollDetection();
        setupNavbarScroll();
        setupHowWeWorkSideImages();
        setupHeroVideoMobile();
    }

    /** On small screens, show poster only and do not autoplay video to save bandwidth and avoid main-thread decode. */
    function setupHeroVideoMobile() {
        var video = document.querySelector('.hero-bg-video');
        if (!video) return;
        function applyMobileVideo() {
            if (window.innerWidth <= 768) {
                video.pause();
                video.currentTime = 0;
            } else {
                video.play().catch(function() {});
            }
        }
        applyMobileVideo();
        window.addEventListener('resize', function() {
            requestAnimationFrame(applyMobileVideo);
        });
    }

    /**
     * How-we-work side images: preload first pair only; lazy-load others when radio is selected.
     * Uses data-src pattern for non-initial pairs to avoid loading all large images up front.
     * decoding="async" and loading="lazy" are set in HTML for the <img> elements.
     */
    function setupHowWeWorkSideImages() {
        const sideImages = document.querySelectorAll('.how-we-work-side-img');
        const galleryInputs = document.querySelectorAll('input[name="how-gallery"]');
        const leftImg = document.querySelector('.how-we-work-side-left .cloud-photo img');
        const rightImg = document.querySelector('.how-we-work-side-right .cloud-photo img');
        if (!sideImages.length || !galleryInputs.length || !leftImg || !rightImg) return;

        const EXIT_DURATION = 480;
        const ENTRANCE_DELAY = 80;

        var pathname = (window.location.pathname || '/').replace(/\/$/, '') || '/';
        var pathDepth = pathname.split('/').filter(Boolean).length;
        var imageBase = (pathDepth > 0 ? '../'.repeat(pathDepth) : '') + 'images/';
        const imagePairs = [
            { left: imageBase + 'business1.jpg', right: imageBase + 'business2.jpg' },
            { left: imageBase + 'planning1.jpg', right: imageBase + 'planning2.jpg' },
            { left: imageBase + 'ux1.jpg', right: imageBase + 'ux2.jpg' },
            { left: imageBase + 'development1.jpg', right: imageBase + 'development2.jpg' },
            { left: imageBase + 'seo1.jpg', right: imageBase + 'seo2.jpg' },
            { left: imageBase + 'testing1.jpg', right: imageBase + 'testing2.jpg' },
            { left: imageBase + 'launching1.jpg', right: imageBase + 'launching2.jpg' },
            { left: imageBase + 'support1.jpg', right: imageBase + 'support2.jpg' }
        ];

        function setImagesForIndex(index) {
            const pair = imagePairs[index];
            if (pair) {
                // Only assign src when needed; first pair is already in HTML src (preloaded)
                leftImg.src = pair.left;
                rightImg.src = pair.right;
            }
        }

        function showSideImages() {
            sideImages.forEach(el => el.classList.add('show'));
        }

        function reanimateSideImages() {
            sideImages.forEach(el => el.classList.add('exit'));

            setTimeout(() => {
                const checked = document.querySelector('input[name="how-gallery"]:checked');
                const index = checked ? Array.prototype.indexOf.call(galleryInputs, checked) : 0;
                setImagesForIndex(index);

                sideImages.forEach(el => {
                    el.classList.remove('exit');
                    el.classList.remove('show');
                });
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        sideImages.forEach(el => el.classList.add('show'));
                    }, ENTRANCE_DELAY);
                });
            }, EXIT_DURATION);
        }

        const checked = document.querySelector('input[name="how-gallery"]:checked');
        if (checked) {
            const index = Array.prototype.indexOf.call(galleryInputs, checked);
            setImagesForIndex(index);
            setTimeout(showSideImages, 100);
        }

        galleryInputs.forEach(input => {
            input.addEventListener('change', function() {
                reanimateSideImages();
                if (document.activeElement && document.activeElement.getAttribute('name') === 'how-gallery') {
                    document.activeElement.blur();
                }
            });
        });

        var section = document.getElementById('how-we-work');
        if (section) {
            section.querySelectorAll('label[for^="how-item-"]').forEach(function(label) {
                label.addEventListener('click', function(e) {
                    e.preventDefault();
                    var input = document.getElementById(label.getAttribute('for'));
                    if (input && input.name === 'how-gallery' && !input.checked) {
                        input.checked = true;
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    var scrollY = window.scrollY || document.documentElement.scrollTop;
                    var sectionTop = section.getBoundingClientRect().top + scrollY;
                    var headerOffset = (document.querySelector('.navbar') && document.querySelector('.navbar').offsetHeight) || 80;
                    var topMargin = 28;
                    var targetScroll = Math.max(0, sectionTop - headerOffset - topMargin);
                    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }, true);
            });
        }
    }

    function setCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    function setupSmoothScrollDetection() {
        const serviceLinks = document.querySelectorAll('a[href="#services"]');
        serviceLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const servicesSection = document.querySelector('#services');
                if (servicesSection) {
                    const elementPosition = servicesSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
                cameFromLink = true;
                setTimeout(() => {
                    cameFromLink = false;
                }, 1000);
            });
        });
    }

    /**
     * Service cards reveal: use IntersectionObserver instead of scroll listener to avoid
     * per-scroll style updates (major cause of scroll jank). Once section is in view (threshold ~0.2),
     * add .reveal so CSS transitions with stagger handle the animation. Disconnect after revealing.
     * On mobile/tablet (<992px), cards show immediately (no reveal) via CSS.
     */
    function setupServicesAnimation() {
        const servicesSection = document.querySelector('.services-section');
        if (!servicesSection) return;

        const isDesktop = window.matchMedia('(min-width: 992px)').matches;
        if (!isDesktop) {
            servicesSection.classList.add('reveal');
            return;
        }

        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        servicesSection.classList.add('reveal');
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px' }
        );

        observer.observe(servicesSection);
    }

    /**
     * Navbar scrolled state: single scroll listener with { passive: true } to avoid blocking scroll.
     * Throttle updates with requestAnimationFrame so we only update class once per frame.
     */
    function setupNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let ticking = false;
        function updateNavbar() {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollPosition > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        updateNavbar();
    }

})();
