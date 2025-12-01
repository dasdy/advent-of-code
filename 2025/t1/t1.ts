import * as fs from 'fs';

const lines = fs.readFileSync('inp_base.txt', 'utf-8').trim().split('\n');
const lines2 = fs.readFileSync('inp_full.txt', 'utf-8').trim().split('\n');

function part1(lines: string[]): void {
    let position = 50;
    let zeros = 0;

    for (const l of lines) {
        let mult = (l[0] === 'L') ? -1 : 1;
        const leftover = parseInt(l.slice(1)) % 100;
        position += mult * leftover;

        if (position < 0) {
            position = 100 + position;
        } else {
            position = position % 100;
        }

        if (position === 0) {
            zeros++;
        }
    }

    console.log(zeros);
}

function part2(lines: string[]): void {
    let position = 50;
    let zeros = 0;

    for (const l of lines) {
        let mult = (l[0] === 'L') ? -1 : 1;
        const prev = position;
        const clicks = parseInt(l.slice(1));
        zeros += Math.floor(clicks / 100);
        const leftover = clicks % 100;
        position += mult * leftover;

        if (prev !== 0 && (position <= 0 || position > 99)) {
            zeros++;
        }
        if (position < 0) {
            position = 100 + position;
        } else {
            position = position % 100;
        }
    }

    console.log(zeros);
}

part1(lines);
part2(lines);

part1(lines2);
part2(lines2);
