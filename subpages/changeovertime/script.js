

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        // loadingScreen: document.getElementById('loading-screen'),
        // gameContainer: document.getElementById('game-container'),
        // progress: document.getElementById('progress'),
        // circleFill: document.getElementById('circle-fill'),
        // countdown: document.getElementById('countdown'),
        // cards: document.querySelectorAll('.card'),
        // shuffleBtn: document.getElementById('shuffleBtn'),
        // modal: document.getElementById('modal'),
        // resultText: document.getElementById('resultText'),
        // helpBtn: document.getElementById('helpBtn'),
        // helpModal: document.getElementById('helpModal'),
        // allModals: document.querySelectorAll('.modal, .help-modal'),
        // closeButtons: document.querySelectorAll('.close-btn'),
        // aboutBtn: document.getElementById('aboutBtn'),
        // aboutModal: document.getElementById('aboutModal'),
        loadingScreen: document.getElementById('loading-screen'),
        gameContainer: document.getElementById('game-container'),
        progress: document.getElementById('progress'),
        circleFill: document.getElementById('circle-fill'),
        countdown: document.getElementById('countdown'),
        cards: document.querySelectorAll('.card'),
        shuffleBtn: document.getElementById('shuffleBtn'),
        modal: document.getElementById('modal'),
        resultText: document.getElementById('resultText'),
        helpBtn: document.getElementById('helpBtn'),
        helpModal: document.getElementById('helpModal'),
        aboutBtn: document.getElementById('aboutBtn'),
        aboutModal: document.getElementById('aboutModal'),
        allModals: document.querySelectorAll('.modal, .help-modal'), // This will now include aboutModal
        closeButtons: document.querySelectorAll('.close-btn')
    };

    let winningCard = 0;
    let canClick = false;

    // Loading Animation Setup
    const duration = 3000;
    const startTime = Date.now();
    const countdownStart = new Date(2024, 11, 31, 23, 59, 57);
    let timeLeft = 3;

    // Loading Animation Functions
    function updateLoading() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);

        if (elements.progress && elements.circleFill) {
            elements.progress.style.width = `${progress}%`;
            elements.circleFill.style.clipPath = `circle(${progress}% at 50% 50%)`;
        }

        if (elapsed < duration) {
            requestAnimationFrame(updateLoading);
        }
    }

const startProgress = 90; // Start at 90%

// Modified Loading Animation Function
function updateLoading() {
    const elapsed = Date.now() - startTime;
    const additionalProgress = (elapsed / duration) * 10; // Only need to fill remaining 10%
    const progress = Math.min(startProgress + additionalProgress, 100); // Start at 90% and go to 100%

    if (elements.progress && elements.circleFill) {
        elements.progress.style.width = `${progress}%`;
        elements.circleFill.style.clipPath = `circle(${progress}% at 50% 50%)`;
    }

    if (elapsed < duration) {
        requestAnimationFrame(updateLoading);
    }
}

    
    // Modal Functions
    function openModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('open'), 10);
    }

    function closeModal(modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    // Game Functions
    function shuffle() {
        canClick = false;
        if (elements.shuffleBtn) {
            elements.shuffleBtn.disabled = true;
        }

        elements.cards.forEach(card => {
            card.classList.remove('flipped');
            card.querySelector('.card-back').classList.remove('winner');
        });

        winningCard = Math.floor(Math.random() * 3);
        elements.cards[winningCard].querySelector('.card-back').classList.add('winner');

        setTimeout(() => {
            canClick = true;
            if (elements.shuffleBtn) {
                elements.shuffleBtn.disabled = false;
            }
        }, 600);
    }
    
    // function shuffle() {
    //     canClick = false;
    //     if (elements.shuffleBtn) {
    //         elements.shuffleBtn.disabled = true;
    //     }
    
    //     const cardPositions = [
    //         'calc(50% - 290px)',  // left card
    //         'calc(50% - 0px)',    // center card
    //         'calc(50% + 290px)'   // right card
    //     ];
    //     const centerPosition = 'calc(50% - 0px)';
    
    //     // Reset cards
    //     elements.cards.forEach(card => {
    //         card.classList.remove('flipped');
    //         card.querySelector('.card-back').classList.remove('winner');
    //     });
    
    //     // First gather to center
    //     elements.cards.forEach(card => {
    //         card.style.transition = 'all 0.6s ease';
    //         card.style.left = centerPosition;
    //         card.style.transform = 'scale(0.9)'; // Add a slight scale down effect
    //     });
    
    //     // Wait for center gathering animation
    //     setTimeout(() => {
    //         // Get new shuffled positions
    //         const shuffledPositions = [...cardPositions].sort(() => Math.random() - 0.5);
    
    //         // Move to new positions
    //         elements.cards.forEach((card, index) => {
    //             card.style.left = shuffledPositions[index];
    //             card.style.transform = 'scale(1)'; // Reset scale
    //         });
    
    //         // Set winning card
    //         winningCard = Math.floor(Math.random() * 3);
    //         elements.cards[winningCard].querySelector('.card-back').classList.add('winner');
    
    //         // Re-enable clicking after animations
    //         setTimeout(() => {
    //             canClick = true;
    //             if (elements.shuffleBtn) {
    //                 elements.shuffleBtn.disabled = false;
    //             }
    //         }, 600);
    //     }, 800);
    // }

    function shuffle() {
        canClick = false;
        if (elements.shuffleBtn) {
            elements.shuffleBtn.disabled = true;
        }
    
        const cardPositions = [
            'calc(50% - 290px)',  // left card
            'calc(50% - 0px)',    // center card
            'calc(50% + 290px)'   // right card
        ];
        const centerPosition = 'calc(50% - 0px)';
    
        // Reset cards
        elements.cards.forEach(card => {
            card.classList.remove('flipped');
            card.querySelector('.card-back').classList.remove('winner');
            // Reset transform to keep flip functionality
            card.style.transform = '';
        });
    
        // First gather to center
        elements.cards.forEach(card => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.left = centerPosition;
            // Use translateZ for gathering effect instead of scale
            card.style.transform = 'translateZ(-50px)';
        });
    
        // Wait for center gathering animation
        setTimeout(() => {
            // Get new shuffled positions
            const shuffledPositions = [...cardPositions].sort(() => Math.random() - 0.5);
    
            // Move to new positions
            elements.cards.forEach((card, index) => {
                card.style.left = shuffledPositions[index];
                // Reset transform to enable flip
                card.style.transform = '';
            });
    
            // Set winning card
            winningCard = Math.floor(Math.random() * 3);
            elements.cards[winningCard].querySelector('.card-back').classList.add('winner');
    
            // Re-enable clicking after animations
            setTimeout(() => {
                canClick = true;
                if (elements.shuffleBtn) {
                    elements.shuffleBtn.disabled = false;
                }
            }, 600);
        }, 800);
    }

    function flipCard(card) {
        if (!canClick || card.classList.contains('flipped')) return;
        
        card.classList.add('flipped');
        const isWinner = parseInt(card.dataset.index) === winningCard;

        setTimeout(() => {
            elements.cards.forEach(c => {
                if (c !== card) c.classList.add('flipped');
            });
        }, 500);

        setTimeout(() => {
            showResult(isWinner);
        }, 2000);
    }

    function showResult(isWinner) {
        if (elements.resultText) {
            if (isWinner) {
                elements.resultText.innerHTML = `
                    <h2>Congratulations! </h2>
                    <p>Your fortune is Good Health this year</p>
                    <div class="prize-image">
                        <img src="public/assets/images/cardw.png" alt="Prize Card">
                    </div>
                    <p class="prize-description">Limited Edition Card #123</p>
                `;
            } else {
                elements.resultText.innerHTML = `
                    <h2>Better luck next time! </h2>
                    <p>Keep trying to win the exclusive card!</p>
                `;
            }

        }
        openModal(elements.modal);
        canClick = false;
    }

    function resetGame() {
        closeModal(elements.modal);
    
        setTimeout(() => {
            elements.cards.forEach(card => {
                card.classList.remove('flipped');
                card.querySelector('.card-back').classList.remove('winner');
            });
    
            canClick = false;
            if (elements.shuffleBtn) {
                elements.shuffleBtn.disabled = true;
            }
    
            setTimeout(() => {
                winningCard = Math.floor(Math.random() * 3);
                elements.cards[winningCard].querySelector('.card-back').classList.add('winner');
    
                setTimeout(() => {
                    canClick = true;
                    if (elements.shuffleBtn) {
                        elements.shuffleBtn.disabled = false;
                    }
                }, 600);
            }, 300);
        }, 300);
    }

    // Initialize Loading Animation
    requestAnimationFrame(updateLoading);

    // Countdown Timer
    const timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (elements.loadingScreen && elements.gameContainer) {
                elements.loadingScreen.style.display = 'none';
                elements.gameContainer.style.display = 'block';
                shuffle();
            }
        } else {
            if (elements.countdown) {
                const currentTime = new Date(countdownStart.getTime() + (3 - timeLeft) * 1000);
                const hours = currentTime.getHours();
                const minutes = currentTime.getMinutes();
                const seconds = currentTime.getSeconds();
                
                let displayHours = hours;
                if (hours > 12) {
                    displayHours = hours - 12;
                } else if (hours === 0) {
                    displayHours = 12;
                }
                
                elements.countdown.textContent = 
                    `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            timeLeft--;
        }
    }, 1000);

    // Event Listeners
    elements.helpBtn.addEventListener('click', () => openModal(elements.helpModal));

    elements.closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalToClose = btn.closest('.modal, .help-modal');
            closeModal(modalToClose);
        });
    });

    window.addEventListener('click', (event) => {
        elements.allModals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    elements.shuffleBtn.addEventListener('click', shuffle);

    elements.cards.forEach(card => {
        card.addEventListener('click', () => flipCard(card));
    });

    document.addEventListener('click', function(event) {
        // Using event delegation to catch clicks on the reset button
        if (event.target && event.target.id === 'resetGame') {
            console.log('Reset button clicked'); // Debug line
            resetGame();
        }
    });

       // Event Listeners
       elements.helpBtn.addEventListener('click', () => openModal(elements.helpModal));
       elements.aboutBtn.addEventListener('click', () => openModal(elements.aboutModal));
   
       elements.closeButtons.forEach(btn => {
           btn.addEventListener('click', () => {
               const modalToClose = btn.closest('.modal, .help-modal');
               closeModal(modalToClose);
           });
       });
   
       window.addEventListener('click', (event) => {
           elements.allModals.forEach(modal => {
               if (event.target === modal || event.target.classList.contains('close-btn')) {
                   closeModal(modal);
               }
           });
       });
});

