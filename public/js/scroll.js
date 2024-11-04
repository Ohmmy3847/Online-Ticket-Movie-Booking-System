const slider = document.getElementById('movieSlider');
        const slideAmount = 288; // Adjust based on card width + padding

        function slideLeft() {
            const currentScroll = parseInt(slider.style.transform.replace('translateX(', '').replace('px)', '') || 0);
            const newScroll = Math.min(0, currentScroll + slideAmount);
            slider.style.transform = `translateX(${newScroll}px)`;
        }

        function slideRight() {
            const currentScroll = parseInt(slider.style.transform.replace('translateX(', '').replace('px)', '') || 0);
            const containerWidth = slider.parentElement.offsetWidth;
            const sliderWidth = slider.offsetWidth;
            const maxScroll = containerWidth - sliderWidth;
            const newScroll = Math.max(maxScroll, currentScroll - slideAmount);
            slider.style.transform = `translateX(${newScroll}px)`;
        }