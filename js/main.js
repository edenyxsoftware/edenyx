(function() {
    'use strict';

    let servicesInitialized = false;
    let isScrolling = false;
    let scrollTimeout = null;
    let lastScrollTop = 0;
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
    }

    function setupHowWeWorkSideImages() {
        const sideImages = document.querySelectorAll('.how-we-work-side-img');
        const galleryInputs = document.querySelectorAll('input[name="how-gallery"]');
        const leftImg = document.querySelector('.how-we-work-side-left img');
        const rightImg = document.querySelector('.how-we-work-side-right img');
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
        var cardsContainer = section ? section.querySelector('.cards-container') : null;
        if (section) {
            section.querySelectorAll('label[for^="how-item-"]').forEach(function(label) {
                label.addEventListener('click', function(e) {
                    e.preventDefault();
                    var input = document.getElementById(label.getAttribute('for'));
                    if (input && input.name === 'how-gallery' && !input.checked) {
                        input.checked = true;
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (section) {
                        var scrollY = window.scrollY || document.documentElement.scrollTop;
                        var sectionTop = section.getBoundingClientRect().top + scrollY;
                        var headerOffset = (document.querySelector('.navbar') && document.querySelector('.navbar').offsetHeight) || 80;
                        var topMargin = 28;
                        var targetScroll = Math.max(0, sectionTop - headerOffset - topMargin);
                        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                    }
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

    function setupServicesAnimation() {
        const serviceCards = document.querySelectorAll('.service-card');
        const servicesSection = document.querySelector('.services-section');
        
        if (!servicesSection || serviceCards.length === 0) return;

        const isDesktop = window.innerWidth >= 992;
        let lastScrollProgress = -1;

        function updateCardVisibility() {
            if (!isDesktop) {
                serviceCards.forEach(card => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
                return;
            }

            const sectionTop = servicesSection.offsetTop;
            const sectionHeight = servicesSection.offsetHeight;
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            const viewportHeight = window.innerHeight;
            
            const sectionStart = sectionTop - viewportHeight;
            const sectionEnd = sectionTop + sectionHeight;
            const scrollProgress = scrollPosition;

            if (cameFromLink && scrollPosition >= sectionTop - viewportHeight * 0.3) {
                serviceCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 150);
                });
                return;
            }

            if (scrollProgress < sectionStart) {
                serviceCards.forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                });
                return;
            }

            if (scrollProgress > sectionEnd) {
                serviceCards.forEach(card => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
                return;
            }

            const scrollInSection = scrollProgress - sectionStart;
            const totalScrollNeeded = (sectionHeight + viewportHeight) * 0.65;
            const scrollRatio = Math.min(Math.max(scrollInSection / totalScrollNeeded, 0), 1);

            serviceCards.forEach((card, index) => {
                const cardStartRatio = index * 0.18;
                const cardEndRatio = cardStartRatio + 0.22;
                
                let cardOpacity = 0;
                let cardTransform = 30;

                if (scrollRatio >= cardEndRatio) {
                    cardOpacity = 1;
                    cardTransform = 0;
                } else if (scrollRatio >= cardStartRatio) {
                    const cardProgress = (scrollRatio - cardStartRatio) / (cardEndRatio - cardStartRatio);
                    cardOpacity = cardProgress;
                    cardTransform = 30 * (1 - cardProgress);
                }

                card.style.opacity = cardOpacity.toString();
                card.style.transform = `translateY(${cardTransform}px)`;
            });
        }

        window.addEventListener('scroll', function() {
            if (!isScrolling) {
                isScrolling = true;
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 150);
            updateCardVisibility();
        });

        updateCardVisibility();
    }

    function setupNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        function handleScroll() {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollPosition > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }

})();
