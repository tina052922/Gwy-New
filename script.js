document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing scripts for index.html');

    // Carousel functionality (unchanged)
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

    // YouTube Player functionality (Updated)
    try {
        let players = {};

        // Function to initialize a single player
        function initializePlayer(videoId) {
            try {
                console.log(`Initializing player for video ID: ${videoId}`);
                players[videoId] = new YT.Player(`player-${videoId}`, {
                    events: {
                        'onReady': (event) => {
                            console.log(`Player ready for video ID: ${videoId}`);
                        },
                        'onError': (event) => {
                            console.error(`YouTube Player Error for ${videoId}:`, event.data);
                            let errorMessage = `Video ${videoId} is unavailable. Please try the external link: `;
                            if (videoId === '3AKs9EZpkXk') {
                                errorMessage += 'https://www.youtube.com/watch?v=3AKs9EZpkXk';
                            } else if (videoId === 'l5NQx0Ze6Mk') {
                                errorMessage += 'https://www.youtube.com/watch?v=l5NQx0Ze6Mk';
                            }
                            alert(errorMessage);
                        },
                        'onStateChange': (event) => {
                            console.log(`Player state changed for ${videoId}:`, event.data);
                            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
                        }
                    }
                });
            } catch (error) {
                console.error(`Error initializing player for ${videoId}:`, error);
                alert(`Failed to initialize player for video ${videoId}. Please try the external link.`);
            }
        }

        // Load YouTube IFrame API and initialize players
        window.onYouTubeIframeAPIReady = function() {
            console.log('YouTube Iframe API ready');
            const tracks = document.querySelectorAll('.music-track');
            if (!tracks || tracks.length === 0) {
                console.warn('No music tracks found on the page.');
                return;
            }

            tracks.forEach(track => {
                const videoId = track.getAttribute('data-video-id');
                if (videoId && !players[videoId]) {
                    initializePlayer(videoId);
                } else {
                    console.warn(`No video ID found for track or player already initialized: ${videoId}`);
                }
            });

            // Attach event listeners for play buttons
            const playButtons = document.querySelectorAll('.play-btn');
            if (playButtons.length === 0) {
                console.warn('No play buttons found on the page.');
            }
            playButtons.forEach(button => {
                const videoId = button.getAttribute('data-video-id');
                button.addEventListener('click', () => {
                    if (players[videoId]) {
                        try {
                            // Pause all other videos
                            Object.keys(players).forEach(id => {
                                if (id !== videoId && players[id].pauseVideo) {
                                    players[id].pauseVideo();
                                    console.log(`Paused other video: ${id}`);
                                }
                            });
                            players[videoId].playVideo();
                            console.log(`Playing video: ${videoId}`);
                        } catch (error) {
                            console.error(`Error playing video ${videoId}:`, error);
                            alert(`Cannot play video ${videoId}. Please try the external link: https://www.youtube.com/watch?v=${videoId}`);
                        }
                    } else {
                        console.error(`Player not found for video ID: ${videoId}`);
                        alert(`Cannot play video ${videoId}. Please try the external link: https://www.youtube.com/watch?v=${videoId}`);
                    }
                });
            });

            // Attach event listeners for pause buttons
            const pauseButtons = document.querySelectorAll('.pause-btn');
            if (pauseButtons.length === 0) {
                console.warn('No pause buttons found on the page.');
            }
            pauseButtons.forEach(button => {
                const videoId = button.getAttribute('data-video-id');
                button.addEventListener('click', () => {
                    if (players[videoId]) {
                        try {
                            players[videoId].pauseVideo();
                            console.log(`Paused video: ${videoId}`);
                        } catch (error) {
                            console.error(`Error pausing video ${videoId}:`, error);
                            alert(`Cannot pause video ${videoId}. Please use the YouTube player controls.`);
                        }
                    } else {
                        console.error(`Player not found for video ID: ${videoId}`);
                        alert(`Cannot pause video ${videoId}. Please use the YouTube player controls.`);
                    }
                });
            });
        };

        // Load the YouTube IFrame API if not already loaded
        if (!window.YT) {
            console.log('Loading YouTube IFrame API');
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.onerror = () => {
                console.error('Failed to load YouTube IFrame API');
                alert('Failed to load YouTube API. Please check your internet connection and try again.');
            };
            const firstScriptTag = document.getElementsByTagName('script')[0];
            if (firstScriptTag) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            } else {
                console.error('No script tags found in document to insert YouTube API script.');
                alert('Error loading YouTube API. Please refresh the page or check your browser settings.');
            }
        } else if (window.YT.loaded) {
            // If API is already loaded, call onYouTubeIframeAPIReady manually
            console.log('YouTube IFrame API already loaded, initializing players');
            window.onYouTubeIframeAPIReady();
        }
    } catch (error) {
        console.error('Error in YouTube player setup:', error);
        alert('An error occurred while setting up the music player. Please refresh the page or check the console for details.');
    }

    // Surprise Modal functionality (unchanged)
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