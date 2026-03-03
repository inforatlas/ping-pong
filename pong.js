const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Ajuste interno do canvas
canvas.width = 400;
canvas.height = 600;

let paused = false;
let gameStarted = false;
let cpuDifficulty = 0.1; // Velocidade de reação da CPU

// Objetos
const user = { x: canvas.width/2 - 50, y: canvas.height - 20, w: 100, h: 10, score: 0, color: "#0DFF72" };
const cpu = { x: canvas.width/2 - 50, y: 10, w: 100, h: 10, score: 0, color: "#FF0D72" };
const ball = { x: canvas.width/2, y: canvas.height/2, r: 10, speed: 7, vX: 5, vY: 5, color: "#FFF" };

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function resetBall() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.vY = -ball.vY;
    ball.speed = 7;
}

// Colisão vertical
function collision(b, p) {
    return b.x + b.r > p.x && b.x - b.r < p.x + p.w &&
           b.y + b.r > p.y && b.y - b.r < p.y + p.h;
}

function update() {
    if (paused || !gameStarted) return;

    ball.x += ball.vX;
    ball.y += ball.vY;

    // AI da CPU (segue a bola horizontalmente)
    cpu.x += (ball.x - (cpu.x + cpu.w/2)) * cpuDifficulty;

    // Colisão com as paredes laterais
    if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) {
        ball.vX = -ball.vX;
    }

    // Verifica se a bola está indo para cima (CPU) ou baixo (USER)
    let player = (ball.y < canvas.height/2) ? cpu : user;

    if (collision(ball, player)) {
        // Cálculo de ângulo baseado onde bate na raquete
        let collidePoint = ball.x - (player.x + player.w/2);
        collidePoint = collidePoint / (player.w/2);
        let angleRad = collidePoint * (Math.PI/4);

        let direction = (ball.y < canvas.height/2) ? 1 : -1;
        ball.vY = direction * ball.speed * Math.cos(angleRad);
        ball.vX = ball.speed * Math.sin(angleRad);

        ball.speed += 0.3;
    }

    // Pontuação
    if (ball.y < 0) {
        user.score++;
        resetBall();
    } else if (ball.y > canvas.height) {
        cpu.score++;
        resetBall();
    }
    scoreElement.innerText = `CPU: ${cpu.score} | VOCÊ: ${user.score}`;
}

function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#000"); // Fundo
    drawRect(user.x, user.y, user.w, user.h, user.color);
    drawRect(cpu.x, cpu.y, cpu.w, cpu.h, cpu.color);
    drawCircle(ball.x, ball.y, ball.r, ball.color);
    
    // Linha central
    ctx.strokeStyle = "#333";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Controle por Toque ou Mouse
canvas.addEventListener("mousemove", e => {
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;
    let mouseX = (e.clientX - rect.left) * scaleX;
    user.x = mouseX - user.w/2;
});

// Touch para Mobile
canvas.addEventListener("touchmove", e => {
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;
    let touchX = (e.touches[0].clientX - rect.left) * scaleX;
    user.x = touchX - user.w/2;
    e.preventDefault();
}, {passive: false});

function startGame(difficulty) {
    cpuDifficulty = difficulty;
    gameStarted = true;
    document.getElementById('menu').style.display = 'none';
}

function togglePause() {
    if (!gameStarted) return;
    paused = !paused;
    document.getElementById('pause-screen').style.display = paused ? 'flex' : 'none';
}

gameLoop();