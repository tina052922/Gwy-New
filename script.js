document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing scripts for index.html');

    // Carousel functionality
    try {
        const carouselInner = document.querySelector('#carouselInner');
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');
        const searchInput = document.querySelector('#searchInput');
        const searchBtn = document.querySelector('#searchBtn');
        const cards = document.querySelectorAll('.card');

        if (carouselInner && cards.length > 0) {
            const cardWidth = cards[0].offsetWidth + 30;
            const totalCards = cards.length;
            const carouselWidth = document.querySelector('.carousel').offsetWidth;
            const visibleCards = Math.floor(carouselWidth / cardWidth);

            const cloneCount = Math.ceil(visibleCards) + 1;
            for (let i = 0; i < cloneCount; i++) {
                const firstClone = cards[i].cloneNode(true);
                const lastClone = cards[totalCards - 1 - i].cloneNode(true);
                carouselInner.appendChild(firstClone);
                carouselInner.insertBefore(lastClone, carouselInner.firstChild);
            }

            const allCards = document.querySelectorAll('.card');
            let currentIndex = cloneCount;

            carouselInner.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

            function updatePosition(animate = true) {
                carouselInner.style.transition = animate
                    ? 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'
                    : 'none';
                carouselInner.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            }

            function moveCarousel(direction) {
                currentIndex += direction;
                updatePosition(true);

                carouselInner.addEventListener('transitionend', function resetPosition() {
                    if (currentIndex >= totalCards + cloneCount) {
                        currentIndex = cloneCount;
                        updatePosition(false);
                    } else if (currentIndex < cloneCount) {
                        currentIndex = totalCards;
                        updatePosition(false);
                    }
                    carouselInner.removeEventListener('transitionend', resetPosition);
                }, { once: true });
            }

            function slideToMemory(memory) {
                const originalCards = Array.from(cards).slice(0, totalCards);
                const lowerMemory = memory.trim().toLowerCase();

                const targetIndex = originalCards.findIndex(card =>
                    card.querySelector('h3').textContent.trim().toLowerCase() === lowerMemory
                );

                if (targetIndex !== -1) {
                    currentIndex = cloneCount + targetIndex;
                    updatePosition(true);
                } else {
                    alert("Memory not found! Try another one.");
                }
            }

            if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));
            if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));

            if (searchBtn && searchInput) {
                searchBtn.addEventListener('click', () => {
                    const searchTerm = searchInput.value.trim();
                    if (searchTerm) {
                        slideToMemory(searchTerm);
                    } else {
                        alert("Please enter a memory or wish to search!");
                    }
                });

                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const searchTerm = searchInput.value.trim();
                        if (searchTerm) {
                            slideToMemory(searchTerm);
                        } else {
                            alert("Please enter a memory or wish to search!");
                        }
                    }
                });
            }

            requestAnimationFrame(() => {
                updatePosition(true);
            });
        }
    } catch (error) {
        console.error('Error in carousel:', error);
    }

    // YouTube Player functionality
    try {
        let players = {};

        window.onYouTubeIframeAPIReady = function() {
            console.log('YouTube Iframe API ready');
            const tracks = document.querySelectorAll('.music-track');
            tracks.forEach(track => {
                const videoId = track.getAttribute('data-video-id');
                try {
                    players[videoId] = new YT.Player(`player-${videoId}`, {
                        events: {
                            'onReady': (event) => {
                                console.log(`Player ready for video ID: ${videoId}`);
                            },
                            'onError': (event) => {
                                console.error(`YouTube Player Error for ${videoId}:`, event.data);
                                alert(`Video ${videoId} is unavailable. Please try the external link.`);
                            }
                        }
                    });
                } catch (error) {
                    console.error(`Error initializing player for ${videoId}:`, error);
                }
            });

            document.querySelectorAll('.play-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const videoId = button.getAttribute('data-video-id');
                    if (players[videoId]) {
                        players[videoId].playVideo();
                        console.log(`Playing video: ${videoId}`);
                    } else {
                        console.error(`Player not found for video ID: ${videoId}`);
                        alert(`Cannot play video ${videoId}. Please try the external link.`);
                    }
                });
            });

            document.querySelectorAll('.pause-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const videoId = button.getAttribute('data-video-id');
                    if (players[videoId]) {
                        players[videoId].pauseVideo();
                        console.log(`Paused video: ${videoId}`);
                    } else {
                        console.error(`Player not found for video ID: ${videoId}`);
                    }
                });
            });
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            console.log('Loading YouTube Iframe API');
        }
    } catch (error) {
        console.error('Error in YouTube player setup:', error);
    }

    // Surprise Modal functionality
    try {
        const surpriseBtn = document.getElementById('surpriseBtn');
        const surpriseModal = document.getElementById('surpriseModal');
        const surpriseMessage = document.getElementById('surpriseMessage');
        const closeBtn = document.getElementById('closeBtn');

        if (surpriseBtn && surpriseModal && surpriseMessage && closeBtn) {
            surpriseBtn.addEventListener('click', () => {
                surpriseModal.classList.add('active');
                surpriseMessage.classList.add('blurred');
                surpriseMessage.classList.remove('revealed');
                console.log('Opened surprise modal');
            });

            closeBtn.addEventListener('click', () => {
                surpriseModal.classList.remove('active');
                console.log('Closed surprise modal');
            });

            surpriseMessage.addEventListener('click', revealSurprise);

            let shakeCount = 0;
            window.addEventListener('devicemotion', (event) => {
                const acceleration = event.accelerationIncludingGravity;
                if (acceleration && surpriseModal.classList.contains('active')) {
                    const total = Math.abs(acceleration.x) + Math.abs(acceleration.y) + Math.abs(acceleration.z);
                    if (total > 20) {
                        shakeCount++;
                        if (shakeCount >= 5) {
                            revealSurprise();
                            shakeCount = 0;
                        }
                    }
                }
            });

            function revealSurprise() {
                surpriseMessage.classList.remove('blurred');
                surpriseMessage.classList.add('revealed');
                document.querySelector('.shake-hint').style.display = 'none';
                console.log('Revealed surprise message');
            }

            surpriseModal.addEventListener('click', (e) => {
                if (e.target === surpriseModal) {
                    surpriseModal.classList.remove('active');
                    console.log('Closed modal by clicking outside');
                }
            });
        }
    } catch (error) {
        console.error('Error in surprise modal:', error);
    }
});