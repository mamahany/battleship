import bombGif from './assets/kaboom2.gif';
import bgMusicUrl from './assets/bgmusic.mp3';
import expMusicUrl from './assets/explosion.mp3';
import { Player } from './classes';
import { randomlyPlaceFleet, playerWon, getWinnerName } from './utils';
const domController = (() => {
    const container = document.querySelector('.container');
    const dialog = document.querySelector('dialog');
    const resultText = document.getElementById('result-text');
    const replayBtn = document.getElementById('replay-btn');
    let onBoardClick = null;

    function renderPlayerBoard(player) {
        const oldPlayerBoard = document.querySelector('.player-board');
        if (oldPlayerBoard) container.removeChild(oldPlayerBoard);
        const playerBoard = document.createElement('div');
        playerBoard.classList.add('player-board');
        let h3 = document.createElement('h3');
        h3.textContent = `FRIENDLY WATERS (${localStorage.getItem('name')})`;
        playerBoard.appendChild(h3);
        playerBoard.style.pointerEvents = 'none';
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                if (player.gameBoard.board[x][y] !== null) {
                    cell.classList.add('placed-ship');
                }
                if (player.gameBoard.attacked.has(`${x},${y}`)) {
                    if (player.gameBoard.board[x][y] !== null) {
                        cell.classList.add('hit');
                    } else {
                        cell.classList.add('miss');
                    }
                }
                playerBoard.appendChild(cell);
            }
        }
        container.appendChild(playerBoard);
    }
    function renderEnemyBoard(enemy) {
        const oldEnemyBoard = document.querySelector('.enemy-board');
        if (oldEnemyBoard) container.removeChild(oldEnemyBoard);
        const enemyBoard = document.createElement('div');
        enemyBoard.classList.add('enemy-board');
        let h3 = document.createElement('h3');
        h3.textContent = 'ENEMY WATERS';
        enemyBoard.appendChild(h3);
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                if (enemy.gameBoard.attacked.has(`${x},${y}`)) {
                    cell.style.pointerEvents = 'none';
                    if (enemy.gameBoard.board[x][y] !== null) {
                        cell.classList.add('hit');
                    } else {
                        cell.classList.add('miss');
                    }
                }
                enemyBoard.appendChild(cell);
            }
        }
        container.appendChild(enemyBoard);
    }
    function attachEnemyClicks(enemy, player) {
        if (onBoardClick) {
            container.removeEventListener('click', onBoardClick);
        }
        onBoardClick = (e) => {
            if (
                !e.target.classList.contains('cell') ||
                !e.target.closest('.enemy-board')
            )
                return;
            const x = +e.target.dataset.x;
            const y = +e.target.dataset.y;
            const explosionMusic = new Audio(expMusicUrl);
            explosionMusic.volume = 0.5;
            explosionMusic.play();
            throwBombAt(x, y);
            document.querySelector('.enemy-board').classList.add('shake');
            disableBoardTemporarily();
            player.attack(enemy, [x, y]);
            if (playerWon(enemy)) {
                showResult(getWinnerName());
                return;
            }
            setTimeout(() => renderAll(enemy, player), 1500);
            computerTurn(enemy, player);
        };
        container.addEventListener('click', onBoardClick);
    }
    function throwBombAt(x, y, boardSelector = '.enemy-board') {
        const board = document.querySelector(boardSelector);
        const cell = board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (!cell) return;
        const gif = document.createElement('img');
        gif.src = bombGif;
        gif.classList.add('explosion-gif');
        cell.appendChild(gif);

        setTimeout(() => gif.remove(), 1000);
    }

    function disableBoardTemporarily(selector = '.enemy-board', delay = 1500) {
        const board = document.querySelector(selector);
        board.style.pointerEvents = 'none';

        setTimeout(() => {
            board.style.pointerEvents = 'auto';
        }, delay);
    }

    function initGame() {
        // Create players
        const computer = new Player(true);
        randomlyPlaceFleet(computer.gameBoard);
        const player = new Player();

        // Create Init Screen
        const initBoard = document.createElement('div');
        initBoard.classList.add('init-board');
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                initBoard.appendChild(cell);
            }
        }
        container.innerHTML = `
            <div class="info">
                <form id="name-form">
                    <label for="name">Enter player name</label>
                    <input type="text" id="name" value="${localStorage.getItem('name') || ''}">
                    <button type="submit">Start</button>
                </form>
                <div class="ships-container">
                    <h3> Drag and Drop your ships to place them</h3>
                    <button id="rotate-btn">Rotate</button>
                    <div class="ships">
                        <div data-length="5" draggable="true" class="ship carrier">Ca</div>
                        <div data-length="4" draggable="true" class="ship battleship">ba</div>
                        <div data-length="3" draggable="true" class="ship cruiser">cr</div>
                        <div data-length="3" draggable="true" class="ship submarine">su</div>
                        <div data-length="2" draggable="true" class="ship destroyer">de</div>
                    </div>
                </div>
            </div>`;
        container.appendChild(initBoard);

        // Attach listeners
        const form = document.querySelector('form#name-form');
        const nameInput = form.querySelector('input');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (nameInput.value !== '') {
                localStorage.setItem('name', nameInput.value);
                if (player.gameBoard.ships.length === 5) {
                    container.innerHTML = '';
                    renderAll(computer, player);
                    attachEnemyClicks(computer, player);
                }
            }
        });
        let isVertical = false;
        let draggedShip = null;
        document.querySelectorAll('.ship').forEach((ship) => {
            ship.addEventListener('dragstart', (e) => {
                draggedShip = ship;
                e.dataTransfer.setDragImage(ship, 0, 0);
            });
        });
        const cells = document.querySelectorAll('.init-board .cell');
        cells.forEach((cell) => {
            cell.addEventListener('dragover', (e) => e.preventDefault());

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                const length = parseInt(draggedShip.dataset.length);
                try {
                    player.gameBoard.placeShip(length, [x, y], isVertical);
                    draggedShip.remove();
                    const startX = x;
                    const startY = y;

                    for (let i = 0; i < length; i++) {
                        const newX = isVertical ? startX + i : startX;
                        const newY = isVertical ? startY : startY + i;
                        const cell = document.querySelector(
                            `.cell[data-x="${newX}"][data-y="${newY}"]`
                        );
                        cell.classList.add('placed-ship');
                    }
                } catch (err) {
                    alert(err.message);
                }
            });
        });

        const bgMusic = new Audio(bgMusicUrl);
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        document.addEventListener(
            'pointerdown',
            () => {
                bgMusic.play().catch(() => {});
            },
            { once: true }
        );
        document.querySelector('#rotate-btn').addEventListener('click', () => {
            isVertical = !isVertical;
            document.querySelectorAll('.ship').forEach((ship) => {
                if (isVertical) {
                    ship.classList.add('vertical');
                    document.querySelector('.ships').classList.add('vertical');
                } else {
                    ship.classList.remove('vertical');
                    document
                        .querySelector('.ships')
                        .classList.remove('vertical');
                }
            });
        });
    }

    // Render Both Boards
    function renderAll(enemy, player) {
        renderPlayerBoard(player);
        renderEnemyBoard(enemy);
    }

    // Make the computer play
    function computerTurn(computer, human) {
        setTimeout(() => {
            const computerBoard = document.querySelector('.enemy-board');
            computerBoard.style.pointerEvents = 'none';
        }, 1500);
        setTimeout(() => {
            const humanBoard = document.querySelector('.player-board');
            let move = computer.getRandomMove();
            const explosionMusic = new Audio(expMusicUrl);
            explosionMusic.volume = 0.5;
            explosionMusic.play();
            let [x, y] = move;
            throwBombAt(x, y, '.player-board');
            humanBoard.classList.add('shake');
            computer.attack(human, move);
            if (playerWon(human)) {
                showResult('Computer');
                return;
            }
            setTimeout(() => {
                renderAll(computer, human);
            }, 1500);
        }, 2000);
    }

    // Show the result dialog
    function showResult(winner) {
        resultText.textContent = `${winner} WON!`;
        dialog.showModal();
    }
    replayBtn.addEventListener('click', () => {
        dialog.close();
        initGame();
    });
    return { initGame };
})();

export { domController};
