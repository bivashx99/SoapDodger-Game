// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let isGameOver = false;
let animationId;
let lastBubbleTime = 0;
let lastMudTime = 0;
let bubbleInterval = 1000; // milliseconds between bubbles
let mudInterval = 5000; // milliseconds between mud powerups
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Player properties
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 70,
    speed: 5,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    color: '#8B4513' // Brown for dirty
};

// Arrays to hold game objects
const bubbles = [];
const mudPowerups = [];

// Key listeners
document.addEventListener('keydown', function(event) {
    if (isGameOver) return;
    
    switch(event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            player.moveUp = true;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            player.moveLeft = true;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            player.moveDown = true;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            player.moveRight = true;
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch(event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            player.moveUp = false;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            player.moveLeft = false;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            player.moveDown = false;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            player.moveRight = false;
            break;
    }
});

// Restart button listener
restartButton.addEventListener('click', function() {
    resetGame();
});

// Create a bubble
function createBubble() {
    const size = Math.random() * 30 + 20; // Bubble size between 20 and 50
    const bubble = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: Math.random() * 2 + 1,
        color: 'rgba(255, 255, 255, 0.7)'
    };
    bubbles.push(bubble);
}

// Create a mud powerup
function createMud() {
    const size = 30;
    const mud = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: Math.random() * 1.5 + 0.5,
        color: '#4b3621' // Dark brown for mud
    };
    mudPowerups.push(mud);
}

// Update player position
function updatePlayer() {
    if (player.moveLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (player.moveRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (player.moveUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (player.moveDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

// Update bubbles
function updateBubbles() {
    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].y += bubbles[i].speed;
        
        // Remove bubbles that go off screen
        if (bubbles[i].y > canvas.height) {
            bubbles.splice(i, 1);
            score++;
            updateScore();
            
            // Increase difficulty every 10 points
            if (score % 10 === 0 && bubbleInterval > 200) {
                bubbleInterval -= 100;
            }
        }
    }
}

// Update mud powerups
function updateMud() {
    for (let i = mudPowerups.length - 1; i >= 0; i--) {
        mudPowerups[i].y += mudPowerups[i].speed;
        
        // Remove mud that goes off screen
        if (mudPowerups[i].y > canvas.height) {
            mudPowerups.splice(i, 1);
        }
    }
}

// Check collisions
function checkCollisions() {
    // Check bubble collisions
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        
        // Simple circle-rectangle collision
        const circleDistanceX = Math.abs(bubble.x + bubble.size/2 - (player.x + player.width/2));
        const circleDistanceY = Math.abs(bubble.y + bubble.size/2 - (player.y + player.height/2));
        
        if (circleDistanceX <= (player.width/2 + bubble.size/2) && 
            circleDistanceY <= (player.height/2 + bubble.size/2)) {
            gameOver();
            return;
        }
    }
    
    // Check mud powerup collisions
    for (let i = mudPowerups.length - 1; i >= 0; i--) {
        const mud = mudPowerups[i];
        
        // Simple circle-rectangle collision
        const circleDistanceX = Math.abs(mud.x + mud.size/2 - (player.x + player.width/2));
        const circleDistanceY = Math.abs(mud.y + mud.size/2 - (player.y + player.height/2));
        
        if (circleDistanceX <= (player.width/2 + mud.size/2) && 
            circleDistanceY <= (player.height/2 + mud.size/2)) {
            // Collected mud powerup
            mudPowerups.splice(i, 1);
            score += 5;
            updateScore();
            
            // Make player visibly more dirty
            player.color = '#3b2314'; // Darker brown
            setTimeout(() => {
                player.color = '#8B4513'; // Return to original brown
            }, 3000);
        }
    }
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    
    // Body
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw face
    ctx.fillStyle = 'black';
    // Eyes
    ctx.beginPath();
    ctx.arc(player.x + player.width * 0.3, player.y + player.height * 0.3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + player.width * 0.7, player.y + player.height * 0.3, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.beginPath();
    ctx.arc(player.x + player.width * 0.5, player.y + player.height * 0.5, 15, 0, Math.PI);
    ctx.stroke();
    
    // Dirt patches
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 15, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + player.width - 12, player.y + 25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + player.height - 20, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Draw bubbles
function drawBubbles() {
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x + bubble.size/2, bubble.y + bubble.size/2, bubble.size/2, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(173, 216, 230, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add shine to bubble
        ctx.beginPath();
        ctx.arc(bubble.x + bubble.size/3, bubble.y + bubble.size/3, bubble.size/8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    });
}

// Draw mud powerups
function drawMud() {
    mudPowerups.forEach(mud => {
        ctx.beginPath();
        ctx.arc(mud.x + mud.size/2, mud.y + mud.size/2, mud.size/2, 0, Math.PI * 2);
        ctx.fillStyle = mud.color;
        ctx.fill();
        
        // Add texture to mud
        ctx.beginPath();
        ctx.arc(mud.x + mud.size/3, mud.y + mud.size/3, mud.size/6, 0, Math.PI * 2);
        ctx.fillStyle = '#5d4037';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(mud.x + mud.size/1.5, mud.y + mud.size/1.8, mud.size/7, 0, Math.PI * 2);
        ctx.fillStyle = '#5d4037';
        ctx.fill();
    });
}

// Update score display
function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

// Game over function
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    finalScoreElement.textContent = `Score: ${score}`;
    gameOverElement.style.display = 'block';
}

// Reset game
function resetGame() {
    score = 0;
    isGameOver = false;
    bubbles.length = 0;
    mudPowerups.length = 0;
    lastBubbleTime = 0;
    lastMudTime = 0;
    bubbleInterval = 1000;
    
    // Reset player position
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.color = '#8B4513';
    
    updateScore();
    gameOverElement.style.display = 'none';
    
    // Start game loop again
    gameLoop(0);
}

// Main game loop
function gameLoop(timestamp) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create bubbles at interval
    if (timestamp - lastBubbleTime > bubbleInterval) {
        createBubble();
        lastBubbleTime = timestamp;
    }
    
    // Create mud powerups at interval
    if (timestamp - lastMudTime > mudInterval) {
        createMud();
        lastMudTime = timestamp;
    }
    
    // Update game objects
    updatePlayer();
    updateBubbles();
    updateMud();
    checkCollisions();
    
    // Draw game objects
    drawPlayer();
    drawBubbles();
    drawMud();
    
    // Continue game loop if not game over
    if (!isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start the game
resetGame(); 