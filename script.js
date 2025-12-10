const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let birdImg = new Image();
let bgImg = new Image();
bgImg.src = "cute.png"; 
let selectedPlayer = null;

// Resize canvas full-screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Bird
let birdSize = 80; 
let birdX = 0;
let birdY = 0;
let velocity = 0;
const gravity = 0.5;
const jump = -12;

// Pipes
let obstacles = [];
let gap = canvas.height / 3; 
let speed = 5;
let horizontalSpacing = 400;

// Game state
let isGameOver = false;

// Score
let score = 0;

// Input
let controlsEnabled = false;
function enableControls() {
    if (controlsEnabled) return;
    controlsEnabled = true;

    document.addEventListener("keydown", (e) => {
        if (!isGameOver && e.code === "Space") velocity = jump;
    });

    document.addEventListener("click", () => {
        if (!isGameOver) velocity = jump;
    });
}

// Select player + start game
function selectPlayer(playerFile) {
    selectedPlayer = playerFile;
    birdImg.src = selectedPlayer;

    const music = document.getElementById("bgMusic");
    music.currentTime = 0;
    music.play().catch(() => {});

    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";

    birdX = canvas.width / 5;
    birdY = canvas.height / 2;
    velocity = 0;
    obstacles = [];
    isGameOver = false;
    score = 0;

    addObstacle();
    addObstacle();

    enableControls();
    loop();
}

// Add pipe
function addObstacle() {
    let topHeight = Math.random() * (canvas.height / 2) + 50;
    let bottomY = topHeight + gap;

    let lastX = obstacles.length > 0 ? obstacles[obstacles.length - 1].x : canvas.width;
    let newX = lastX + horizontalSpacing;

    obstacles.push({
        x: newX,
        topHeight,
        bottomY,
        passed: false
    });
}

// Draw pipe
function drawPipe(x, topHeight, bottomY) {
    ctx.fillStyle = "green";
    ctx.fillRect(x, 0, 80, topHeight);
    ctx.fillRect(x, bottomY, 80, canvas.height - bottomY);
}

// GAME OVER + Restart
function showGameOver() {
    if (isGameOver) return;
    isGameOver = true;

    // Stop music
    const music = document.getElementById("bgMusic");
    music.pause();

    // Play death sound
    const deathSound = document.getElementById("deathSound");
    deathSound.currentTime = 0;
    deathSound.play();

    // Dark background
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width/2, canvas.height/2 - 50);

    // Restart button
    const btnWidth = 200;
    const btnHeight = 60;
    const btnX = canvas.width/2 - btnWidth/2;
    const btnY = canvas.height/2 + 20;

    ctx.fillStyle = "green";
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Restart", canvas.width/2, canvas.height/2 + 60);

    // Click to restart → back to menu
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if(mouseX > btnX && mouseX < btnX + btnWidth &&
           mouseY > btnY && mouseY < btnY + btnHeight){

            canvas.onclick = null;
            canvas.style.display = "none";
            document.getElementById("menu").style.display = "block";
        }
    };
}

// GAME LOOP
function loop() {
    // Draw background
    if(bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }

    if(isGameOver){
        showGameOver();
        return;
    }

    // Bird movement
    velocity += gravity;
    birdY += velocity;

    ctx.drawImage(birdImg, birdX - birdSize/2, birdY - birdSize/2, birdSize, birdSize);

    // Pipes
    for(let i = obstacles.length-1; i>=0; i--){
        let o = obstacles[i];
        o.x -= speed;

        drawPipe(o.x, o.topHeight, o.bottomY);

        // Score
        if(!o.passed && o.x + 80 < birdX - birdSize/2){
            score++;
            o.passed = true;
        }

        // Collision
        if(birdX + birdSize/2 > o.x && birdX - birdSize/2 < o.x + 80){
            if(birdY - birdSize/2 < o.topHeight || birdY + birdSize/2 > o.bottomY){
                return showGameOver();
            }
        }

        // Remove + add pipes
        if(o.x + 80 < 0) obstacles.splice(i,1);
        if(i === obstacles.length - 1 && o.x < canvas.width - horizontalSpacing){
            addObstacle();
        }
    }

    // Border collision
    if(birdY + birdSize/2 > canvas.height || birdY - birdSize/2 < 0){
        return showGameOver();
    }

    // Score text
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Score: " + score, 30, 50);

    requestAnimationFrame(loop);
}
