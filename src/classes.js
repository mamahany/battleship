class Ship {
    constructor(length) {
        this.length = length;
        this.hits = 0;
    }
    hit() {
        if (!this.isSunk()) {
            this.hits++;
        }
    }
    isSunk() {
        return this.hits === this.length;
    }
}

class GameBoard {
    constructor() {
        this.board = Array.from({ length: 10 }, () =>
            Array.from({ length: 10 }, () => null)
        );
        this.ships = [];
        this.missed = [];
        this.attacked = new Set();
    }
    placeShip(length, [startRow, startCol], isVertical) {
        if (startRow < 0 || startRow >= 10 || startCol < 0 || startCol >= 10)
            throw Error('Out of bounds start');
        if (isVertical) {
            if (startRow + length > 10) throw Error('Out of bounds vertically');
        } else {
            if (startCol + length > 10)
                throw Error('Out of bounds horizontally');
        }
        for (let i = 0; i < length; i++) {
            const row = isVertical ? startRow + i : startRow;
            const col = isVertical ? startCol : startCol + i;
            if (this.board[row][col] !== null) {
                throw new Error("Ship can't be placed here — not empty");
            }
        }
        const s = new Ship(length);
        this.ships.push(s);
        for (let i = 0; i < length; i++) {
            const row = isVertical ? startRow + i : startRow;
            const col = isVertical ? startCol : startCol + i;
            this.board[row][col] = s;
        }
    }
    receiveAttack([xCoord, yCoord]) {
        let [x, y] = [xCoord, yCoord];
        if (y < 0 || y >= 10 || x < 0 || x >= 10) {
            throw new Error("Can't attack out of the board");
        }
        const key = `${x},${y}`;
        if (this.attacked.has(key)) return;
        this.attacked.add(key);
        if (this.board[x][y] !== null) {
            this.board[x][y].hit();
        } else {
            this.missed.push([x, y]);
        }
    }
    allSunk() {
        return this.ships.every((ship) => ship.isSunk());
    }
}

class Player {
    constructor(isComputer = false) {
        this.isComputer = isComputer;
        this.gameBoard = new GameBoard();
        if (!this.isComputer) return;
        this.coords = [];
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                this.coords.push([x, y]);
            }
        }
        for (let i = this.coords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.coords[i], this.coords[j]] = [this.coords[j], this.coords[i]];
        }
    }
    attack(opp, [x, y]) {
        opp.gameBoard.receiveAttack([x, y]);
    }
    getRandomMove() {
        return this.coords.pop();
    }
}
export { Ship, GameBoard, Player };
