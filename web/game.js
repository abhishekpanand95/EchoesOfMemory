// Game constants
const CELL_SIZE = 40;
const MAZE_SIZE = 15;
const MARGIN = 20;
const NEON_BLUE = '#00ffff';
const NEON_PURPLE = '#ff00ff';
const NEON_PINK = '#ff69b4';
const NEON_GREEN = '#00ff00';

// Game state
let canvas, ctx;
let maze = [];
let player = { x: 0, y: 0 };
let fruits = [];
let score = 0;
let gameLoop;
let particles = [];

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = MAZE_SIZE * CELL_SIZE + 2 * MARGIN;
    canvas.height = MAZE_SIZE * CELL_SIZE + 2 * MARGIN;
    
    // Generate maze
    generateMaze();
    
    // Set up event listeners
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    // Start game loop
    gameLoop = setInterval(update, 1000 / 60);
}

// Generate maze using recursive backtracking
function generateMaze() {
    // Initialize maze with walls
    maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(1));
    
    // Start from top-left corner
    maze[0][0] = 0;
    
    // Recursive function to carve paths
    function carve(x, y) {
        const directions = [
            [0, 2], [2, 0], [0, -2], [-2, 0]
        ].sort(() => Math.random() - 0.5);
        
        for (let [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] === 1) {
                maze[y + dy/2][x + dx/2] = 0;
                maze[newY][newX] = 0;
                carve(newX, newY);
            }
        }
    }
    
    carve(0, 0);
    
    // Place player at start
    player.x = 0;
    player.y = 0;
    
    // Place fruits
    fruits = [];
    for (let i = 0; i < 3; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * MAZE_SIZE);
            y = Math.floor(Math.random() * MAZE_SIZE);
        } while (maze[y][x] === 1 || (x === player.x && y === player.y));
        fruits.push({ x, y });
    }
}

// Handle keyboard input
function handleKeyPress(event) {
    const key = event.key.toLowerCase();
    let newX = player.x;
    let newY = player.y;
    
    switch(key) {
        case 'arrowleft':
        case 'a':
            newX--;
            break;
        case 'arrowright':
        case 'd':
            newX++;
            break;
        case 'arrowup':
        case 'w':
            newY--;
            break;
        case 'arrowdown':
        case 's':
            newY++;
            break;
        case 'r':
            restartGame();
            break;
        case 'escape':
            clearInterval(gameLoop);
            return;
    }
    
    if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] === 0) {
        player.x = newX;
        player.y = newY;
        checkFruitCollection();
    }
}

// Check if player collected a fruit
function checkFruitCollection() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        if (fruits[i].x === player.x && fruits[i].y === player.y) {
            fruits.splice(i, 1);
            score++;
            createParticles(player.x, player.y, NEON_PINK);
            document.getElementById('score').textContent = `Score: ${score}/3`;
            
            if (score === 3) {
                winGame();
            }
        }
    }
}

// Create particle effects
function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 2 + Math.random() * 2;
        particles.push({
            x: (x + 0.5) * CELL_SIZE + MARGIN,
            y: (y + 0.5) * CELL_SIZE + MARGIN,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: color
        });
    }
}

// Update game state
function update() {
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    draw();
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = NEON_BLUE;
                ctx.fillRect(
                    x * CELL_SIZE + MARGIN,
                    y * CELL_SIZE + MARGIN,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
    }
    
    // Draw fruits
    ctx.fillStyle = NEON_PURPLE;
    for (let fruit of fruits) {
        ctx.beginPath();
        ctx.arc(
            fruit.x * CELL_SIZE + MARGIN + CELL_SIZE/2,
            fruit.y * CELL_SIZE + MARGIN + CELL_SIZE/2,
            CELL_SIZE/3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // Draw player
    ctx.fillStyle = NEON_GREEN;
    ctx.beginPath();
    ctx.arc(
        player.x * CELL_SIZE + MARGIN + CELL_SIZE/2,
        player.y * CELL_SIZE + MARGIN + CELL_SIZE/2,
        CELL_SIZE/3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw particles
    for (let p of particles) {
        ctx.fillStyle = `rgba(${p.color === NEON_PINK ? '255,105,180' : '0,255,0'}, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Win game
function winGame() {
    clearInterval(gameLoop);
    document.getElementById('win-overlay').style.display = 'flex';
    
    // Create multiple celebration effects
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createParticles(
                Math.floor(Math.random() * MAZE_SIZE),
                Math.floor(Math.random() * MAZE_SIZE),
                NEON_GREEN
            );
        }, i * 200);
    }
}

// Restart game
function restartGame() {
    score = 0;
    particles = [];
    document.getElementById('score').textContent = 'Score: 0/3';
    document.getElementById('win-overlay').style.display = 'none';
    generateMaze();
    if (!gameLoop) {
        gameLoop = setInterval(update, 1000 / 60);
    }
}

// Start game when page loads
window.onload = init; 