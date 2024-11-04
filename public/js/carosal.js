document.addEventListener("DOMContentLoaded", function() {
    let currentIndex = 0;
    let autoplayInterval;
    const carousel = document.getElementById('default-carousel');
    const items = carousel.querySelectorAll('[data-carousel-item]');
    const totalItems = items.length;
    const autoplayDelay = 5000; // 5 seconds between slides

    // Check if items are found
    if (totalItems === 0) {
        console.error("No carousel items found.");
        return;
    }

    function showItem(index) {
        items.forEach(item => {
            item.classList.add('hidden');
            item.classList.remove('active');
        });
        items[index].classList.remove('hidden');
        setTimeout(() => {
            items[index].classList.add('active');
        }, 50);
        updateIndicators();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalItems;
        showItem(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        showItem(currentIndex);
    }

    // Update indicators based on current index
    function updateIndicators() {
        const indicators = carousel.querySelectorAll('[data-carousel-slide-to]');
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('bg-white');
                indicator.classList.remove('bg-white/30');
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.classList.remove('bg-white');
                indicator.classList.add('bg-white/30');
                indicator.setAttribute('aria-current', 'false');
            }
        });
    }

    // Start autoplay
    function startAutoplay() {
        stopAutoplay(); // Clear any existing interval
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
    }

    // Stop autoplay
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    // Event Listeners
    carousel.querySelector('[data-carousel-next]').addEventListener('click', () => {
        stopAutoplay();
        nextSlide();
        startAutoplay();
    });

    carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => {
        stopAutoplay();
        prevSlide();
        startAutoplay();
    });

    // Indicator click events
    carousel.querySelectorAll('[data-carousel-slide-to]').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoplay();
            currentIndex = index;
            showItem(currentIndex);
            startAutoplay();
        });
    });

    // Show the first item and start autoplay
    showItem(currentIndex);
    startAutoplay();

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
});