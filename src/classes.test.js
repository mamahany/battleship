import { Ship, GameBoard, Player } from './classes.js';

describe('Ship class', () => {
    const s = new Ship(5);
    test('Length works', () => {
        expect(s.length).toBe(5);
    });

    test('Default isSunk() == false', () => {
        expect(s.isSunk()).toBe(false);
    });

    test('isSunk() still equals false after two hits < length', () => {
        s.hit();
        s.hit();
        expect(s.isSunk()).toBe(false);
    });
    test('isSunk() equals true after 5 hits = length', () => {
        s.hit();
        s.hit();
        s.hit();
        expect(s.isSunk()).toBe(true);
    });
    test('hits after sunk are ignored', () => {
        s.hit();
        s.hit();
        expect(s.hits).toBe(5);
    });
});

describe('GameBoard class', () => {
    const g = new GameBoard();
    test('Cant place Ships on taken spots', () => {
        g.placeShip(7, [0, 0], true);
        expect(() => g.placeShip(1, [5, 0], true)).toThrow();
        expect(() => g.placeShip(5, [6, 0], false)).toThrow();
    });
    test('Cant place Ships out of the board', () => {
        expect(() => g.placeShip(3, [-1, 0], false)).toThrow();
    });
    test('Cant attack out of the board', () => {
        expect(() => g.receiveAttack([0, 11])).toThrow();
        expect(() => g.receiveAttack([5, -3])).toThrow();
    });
    test('allSunk ==  false by default', () => {
        expect(g.allSunk()).toBe(false);
    });
    test('Misses are recorded', () => {
        g.receiveAttack([5, 5]);
        expect(g.missed).toContainEqual([5, 5]);
    });
    test('allSunk == true after all ships are sunk', () => {
        g.receiveAttack([0, 0]);
        g.receiveAttack([1, 0]);
        g.receiveAttack([2, 0]);
        g.receiveAttack([3, 0]);
        g.receiveAttack([4, 0]);
        g.receiveAttack([5, 0]);
        g.receiveAttack([6, 0]);
        expect(g.allSunk()).toBe(true);
    });
});

describe('Player class', () => {
    const human = new Player();
    const computer = new Player(true);

    test('Human Player is not a computer', () => {
        expect(human.isComputer).toBe(false);
    });
    test('Computer Player is a computer', () => {
        expect(computer.isComputer).toBe(true);
    });
    test('Computer player makes 100 unique random moves', () => {
        const seen = new Set();
        for (let i = 0; i < 100; i++) {
            const move = computer.getRandomMove();
            const key = move.join(',');
            expect(seen.has(key)).toBe(false);
            seen.add(key);
        }
        expect(computer.coords.length).toBe(0);
    });
});
