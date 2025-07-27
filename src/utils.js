function randomlyPlaceFleet(board, lengths = [5, 4, 3, 3, 2]) {
    for (let length of lengths) {
        let placed = false;
        while (!placed) {
            const isVertical = Math.random() < 0.5;
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            try {
                board.placeShip(length, [x, y], isVertical);
                placed = true;
            } catch {}
        }
    }
}

function playerWon(player) {
    return player.gameBoard.allSunk();
}

function getWinnerName() {
    return localStorage.getItem('name');
}

export { randomlyPlaceFleet, playerWon, getWinnerName };
