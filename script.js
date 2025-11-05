// Preloader Animation
document.addEventListener('DOMContentLoaded', () => {
    // Check if device is mobile
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Initialize main animations immediately
    initMainAnimations();
    
    // Skip preloader on mobile devices
    if (isMobile) {
        console.log('Mobile device detected - skipping preloader');
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
        return; // Exit early for mobile devices
    }
    
    // Initialize GSAP for desktop
    gsap.registerPlugin(ScrollTrigger);
    
    const preloader = document.querySelector('.preloader');
    const preloaderImages = document.querySelectorAll('.preloader-image');
    const textReveal = document.querySelectorAll('.text-reveal');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercentage = document.querySelector('.loading-percentage span');
    const particlesContainer = document.querySelector('.particles-container');
    
    // Create particles
    createParticles();
    
    // Function to create particles
    function createParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Random size
            const size = Math.random() * 4 + 1;
            
            // Random opacity
            const opacity = Math.random() * 0.5 + 0.3;
            
            // Set styles
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = opacity;
            
            // Add to container
            particlesContainer.appendChild(particle);
            
            // Animate with GSAP
            animateParticle(particle);
        }
    }
    
    // Function to animate a particle
    function animateParticle(particle) {
        // Random duration
        const duration = Math.random() * 20 + 10;
        
        // Random movement
        const xMove = (Math.random() - 0.5) * 20;
        const yMove = (Math.random() - 0.5) * 20;
        
        gsap.to(particle, {
            x: xMove,
            y: yMove,
            duration: duration,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
        
        // Pulsating effect
        gsap.to(particle, {
            opacity: Math.random() * 0.7 + 0.1,
            duration: Math.random() * 2 + 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
    
    // Create timelines for different animation sequences
    const mainPreloaderTL = gsap.timeline();
    
    // Preload all images
    const imagePromises = [];
    const imagesToLoad = [];
    
    // Add all images from the page to be preloaded
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) return;
        
        const promise = new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // Also resolve on error to avoid hanging
        });
        
        imagePromises.push(promise);
        imagesToLoad.push(img);
    });
    
    // Set initial position for all images (center)
    preloaderImages.forEach(img => {
        // We're not setting scale here because it's already in the CSS transform
        gsap.set(img, {
            opacity: 0
            // The translate(-50%, -50%) is already in the CSS
        });
    });
    
    // Set up variables for image movement
    const totalImages = preloaderImages.length;
    const middleIndex = Math.floor(totalImages / 2);
    
    // Only fade in the images initially, movement will happen at 40% loading
    const imageAppearanceTL = gsap.timeline();
    
    preloaderImages.forEach((img, index) => {
        // Slightly stagger the appearance
        imageAppearanceTL.to(img, {
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            onComplete: () => {
                // Add active class for color transition
                img.classList.add('active');
            }
        }, index * 0.15);
    });
    
    // Function to start image movement at 40% loading
    function startImageMovement() {
        const imageMovementTL = gsap.timeline();
        
        preloaderImages.forEach((img, index) => {
            // Determine direction (left or right)
            let xDirection = 0;
            let yOffset = 0;
            let rotation = 0;
            
            if (index < middleIndex) {
                // Move to left - increase spacing
                xDirection = -400 - (index * 150); // Wider spacing
                rotation = -5 - (index * 3); // Rotate slightly counter-clockwise
                yOffset = index % 2 === 0 ? -80 : 80; // More vertical separation
            } else if (index > middleIndex) {
                // Move to right - increase spacing
                xDirection = 400 + ((index - middleIndex - 1) * 150); // Wider spacing
                rotation = 5 + ((index - middleIndex - 1) * 3); // Rotate slightly clockwise
                yOffset = index % 2 === 0 ? 80 : -80; // More vertical separation
            }
            
            // For middle image or if there's an even number of images
            if (index === middleIndex) {
                // Keep middle image in center
                xDirection = 0;
                rotation = 0;
                yOffset = 0;
            }
            
            // First scale up slightly
            imageMovementTL.to(img, {
                transform: `translate(-50%, -50%) scale(1.1)`,
                duration: 0.8, // Slower scale up
                ease: 'power2.out'
            }, index * 0.15); // Even more delay between images
            
            // Then move to final position with staggered timing
            imageMovementTL.to(img, {
                transform: `translate(calc(-50% + ${xDirection}px), calc(-50% + ${yOffset}px)) rotate(${rotation}deg) scale(1)`,
                duration: 2.5, // Much slower movement
                ease: 'power3.inOut'
            }, 1.0 + (index * 0.25)); // More staggered movement with longer delays
        });
    }
    
    // Animate the text reveals
    const textRevealTL = gsap.timeline();
    
    textReveal.forEach((text, index) => {
        textRevealTL.to(text, {
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
                // Add active class for underline animation
                setTimeout(() => {
                    text.classList.add('active');
                }, 100);
            }
        }, index * 0.15); // Stagger the text reveals
    });
    
    // Add animations to main timeline
    mainPreloaderTL.add(imageAppearanceTL, 0); // Start image appearance immediately
    mainPreloaderTL.add(textRevealTL, 1); // Start text reveal after 1 second
    
    // Simulate loading progress
    let loadProgress = 0;
    let imagesStartedMoving = false;
    
    const updateProgress = () => {
        // Calculate the total progress based on loaded images and time
        const timeProgress = Math.min(loadProgress, 100);
        loadingBar.style.width = `${timeProgress}%`;
        loadingPercentage.textContent = `${Math.round(timeProgress)}%`;
        
        // Start moving images at 40% progress
        if (timeProgress >= 40 && !imagesStartedMoving) {
            imagesStartedMoving = true;
            startImageMovement();
        }
        
        if (loadProgress < 100) {
            // Adjust progress increment - faster from 88% onwards
            let increment;
            if (loadProgress < 40) {
                increment = 0.5; // Normal speed up to 40%
            } else if (loadProgress < 76) {
                increment = 0.25; // Slower from 40% to 88%
            } else {
                increment = 2.0; // Much faster from 88% to 100%
            }
            loadProgress += increment;
            setTimeout(updateProgress, 100); // Update every 100ms instead of 50ms
        } else {
            // When loading is complete, finish the animation and hide the preloader
            setTimeout(() => {
                // Final animation to hide the preloader
                gsap.to(preloader, {
                    opacity: 0,
                    duration: 1.5, // Slower fade out
                    onComplete: () => {
                        preloader.style.display = 'none';
                        initMainAnimations();
                    }
                });
            }, 2000); // Wait 2 seconds after reaching 100%
        }
    };
    
    // Start the progress animation
    updateProgress();
    
    // Wait for all images to load or at least 5 seconds, whichever comes first
    Promise.race([
        Promise.all(imagePromises),
        new Promise(resolve => setTimeout(resolve, 5000)) // Longer timeout
    ]).then(() => {
        // Ensure we reach 100% more gradually after images are loaded
        const remainingProgress = 100 - loadProgress;
        
        // More gradual speedup with smaller increments
        const speedUpLoading = () => {
            if (loadProgress < 100) {
                // Calculate increment based on remaining progress
                // Slower at first, faster as we approach 100%
                const progressLeft = 100 - loadProgress;
                const increment = Math.max(0.2, progressLeft / 30);
                
                loadProgress += increment;
                setTimeout(speedUpLoading, 150); // Slower updates
            }
        };
        
        speedUpLoading();
    });
});

// Main page animations
function initMainAnimations() {
    console.log('Main page animations initialized');
    // Add your main page animations here
    // This function will be called after the preloader is hidden
    
    // Mobile menu functionality
    console.log('Setting up mobile menu functionality');
    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenu = document.querySelector('.close-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    console.log('Menu elements found:', {
        menuToggle: menuToggle ? true : false,
        closeMenu: closeMenu ? true : false,
        mobileMenu: mobileMenu ? true : false,
        mobileLinks: mobileLinks.length
    });

    if (menuToggle && closeMenu && mobileMenu) {
        console.log('Adding event listeners to menu elements');
        
        // Add direct onclick attribute as a backup
        menuToggle.setAttribute('onclick', "document.querySelector('.mobile-menu').classList.remove('translate-x-full'); console.log('Menu clicked via onclick');");
        
        menuToggle.addEventListener('click', () => {
            console.log('Menu toggle clicked');
            mobileMenu.classList.remove('translate-x-full');
        });

        closeMenu.addEventListener('click', () => {
            console.log('Close menu clicked');
            mobileMenu.classList.add('translate-x-full');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                console.log('Mobile link clicked');
                mobileMenu.classList.add('translate-x-full');
            });
        });
    } else {
        console.error('Mobile menu elements not found properly');
    }

    // Navbar scroll effect with blur using class
    const header = document.querySelector('header');
    const navbar = document.querySelector('nav');
    
    // Check if backdrop-filter is supported
    function isBackdropFilterSupported() {
        // Create a test element
        const testEl = document.createElement('div');
        testEl.style.backdropFilter = 'blur(1px)';
        // If the style is applied, backdrop-filter is supported
        const isSupported = testEl.style.backdropFilter === 'blur(1px)';
        console.log('Backdrop filter support:', isSupported);
        return isSupported;
    }
    
    // Force enable hardware acceleration for Safari
    function forceHardwareAcceleration(element) {
        // This trick forces hardware acceleration in many browsers
        element.style.transform = 'translateZ(0)';
        element.style.backfaceVisibility = 'hidden';
        element.style.perspective = '1000px';
    }
    
    if (navbar && header) {
        console.log('Navbar and header found');
        
        // Check if backdrop-filter is supported
        const blurSupported = isBackdropFilterSupported();
        
        // Apply hardware acceleration
        forceHardwareAcceleration(navbar);
        
        // Get the dedicated blur element
        const blurElement = navbar.querySelector('div:first-child');
        console.log('Blur element found:', !!blurElement);
        
        // Apply direct blur effect regardless of scroll position
        if (blurElement) {
            // Apply blur to the dedicated element instead of the navbar
            if (blurSupported) {
                console.log('Using backdrop-filter for blur element');
                blurElement.style.backdropFilter = 'blur(25px)';
                blurElement.style.webkitBackdropFilter = 'blur(25px)';
            } else {
                console.log('Backdrop filter not supported, using fallback for blur element');
                // Fallback to just a semi-transparent background
                blurElement.style.backgroundColor = 'rgba(245, 245, 245, 0.95)';
            }
        } else {
            // Fallback to applying styles directly to navbar if blur element not found
            console.log('No blur element found, applying styles to navbar directly');
            if (blurSupported) {
                navbar.style.backdropFilter = 'blur(25px)';
                navbar.style.webkitBackdropFilter = 'blur(25px)';
            } else {
                navbar.style.backgroundColor = 'rgba(245, 245, 245, 0.95)';
            }
        }
        
        // Initial check in case page is loaded scrolled down
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
            navbar.classList.add('py-3');
            navbar.classList.remove('py-6');
        }
        
        // Also apply the class for additional styling
        navbar.classList.add('nav-blur');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // Lower threshold for quicker effect
                header.classList.add('scrolled');
                navbar.classList.add('py-3'); // Slightly smaller padding
                navbar.classList.remove('py-6');
                
                // Make background more opaque when scrolled
                if (blurElement) {
                    // Update the blur element's background
                    blurElement.style.backgroundColor = 'rgba(245, 245, 245, 0.95)';
                    // Increase blur strength when scrolled
                    if (blurSupported) {
                        blurElement.style.backdropFilter = 'blur(30px)';
                        blurElement.style.webkitBackdropFilter = 'blur(30px)';
                    }
                } else {
                    // Fallback to navbar if no blur element
                    navbar.style.backgroundColor = 'rgba(245, 245, 245, 0.95)';
                }
            } else {
                header.classList.remove('scrolled');
                navbar.classList.remove('py-3');
                navbar.classList.add('py-6');
                
                // Make background slightly more transparent when at top
                if (blurElement) {
                    // Update the blur element's background
                    blurElement.style.backgroundColor = 'rgba(245, 245, 245, 0.85)';
                    // Standard blur strength at top
                    if (blurSupported) {
                        blurElement.style.backdropFilter = 'blur(25px)';
                        blurElement.style.webkitBackdropFilter = 'blur(25px)';
                    }
                } else {
                    // Fallback to navbar if no blur element
                    navbar.style.backgroundColor = 'rgba(245, 245, 245, 0.85)';
                }
            }
            
            // Log current state for debugging
            console.log('Scroll position:', window.scrollY, 'Blur applied:', navbar.classList.contains('nav-blur'));
        });
        
        // Trigger the scroll handler once to set initial state
        window.dispatchEvent(new Event('scroll'));
    }
    
    // Active link highlighting
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section[id]');
    
    function setActiveLink() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if(link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', setActiveLink);
    
    // Simple reveal animation - all elements are visible by default
    // This simplified version ensures everything is visible even if scroll detection fails
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, checking for about section');
        
        // Check if about section exists
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            console.log('About section found:', aboutSection);
            // Add a visible indicator
            aboutSection.style.border = '5px solid red';
            aboutSection.style.position = 'relative';
            aboutSection.style.zIndex = '999';
            
            // Add a floating indicator
            const indicator = document.createElement('div');
            indicator.textContent = 'ABOUT SECTION IS HERE';
            indicator.style.position = 'absolute';
            indicator.style.top = '0';
            indicator.style.left = '0';
            indicator.style.backgroundColor = 'red';
            indicator.style.color = 'white';
            indicator.style.padding = '10px';
            indicator.style.zIndex = '1000';
            aboutSection.appendChild(indicator);
        } else {
            console.error('About section not found!');
            
            // Create a floating notification
            const notification = document.createElement('div');
            notification.textContent = 'ABOUT SECTION NOT FOUND!';
            notification.style.position = 'fixed';
            notification.style.top = '50%';
            notification.style.left = '50%';
            notification.style.transform = 'translate(-50%, -50%)';
            notification.style.backgroundColor = 'red';
            notification.style.color = 'white';
            notification.style.padding = '20px';
            notification.style.zIndex = '9999';
            document.body.appendChild(notification);
        }
        
        // Force all animations to run
        const revealElements = document.querySelectorAll('.reveal-element, .reveal-text, .reveal-line, .reveal-image, .reveal-feature, .reveal-button');
        console.log('Found reveal elements:', revealElements.length);
        
        revealElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.animationPlayState = 'running';
        });
    });
}
