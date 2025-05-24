export function huntAndKill(width: number, height: number): number[][] {

  width -= width % 2;
  width++;
  height -= height % 2;
  height++;

  //TODO: Implement Hunt & Kill algorithm
  let maze: number[][] = [];
  for (let i: number = 0; i < width; i++) {
    maze.push([])                                   //Add width
    for (let j: number = 0; j < height; j++) {
      maze[i].push(1);                            //Fill with walls
    }
  }

  maze[0][1] = 0;         //Opening (top)
  maze[15][15] = 0;        //Exit (none because micro mouse has to reach the middle)

  let currentlyOn: number[] = [1, 1];

  while (!complete(maze)) {
    const neighbor = neighbors(maze, currentlyOn[0], currentlyOn[1]);
    if (neighbor.length == 0) {
      const t: number[][] = findCoordinate(maze);
      currentlyOn = t[0];

      maze[currentlyOn[0]][currentlyOn[1]] = 0;
      maze[(currentlyOn[0] + t[1][0]) / 2][(currentlyOn[1] + t[1][1]) / 2] = 0;
    }
    else {
      let i: number = Math.floor(Math.random() * neighbor.length);
      let nb: number[] = neighbor[i];
      maze[nb[0]][nb[1]] = 0;
      maze[(nb[0] + currentlyOn[0]) / 2][(nb[1] + currentlyOn[1]) / 2] = 0;

      currentlyOn = nb.slice();
    }
  }

  //[13,14][13,15][13,16]
  //[14,14][14,15][15,16]
  //[15,14][15,15][15,16]
  //[16,14][17,16][16,16]

  maze[0][1] = 2;

  maze[14][14] = 0;
  maze[14][15] = 0;
  maze[14][16] = 0;
  maze[13][15] = 0;

  maze[15][14] = 1;

  //maze[15][16] = 1;

  maze[16][14] = 1;
  maze[16][15] = 1;
  //maze[16][16] = 1;

  maze[15][15] = 3;

  return maze;
}
function neighbors(maze: number[][], a: number, b: number): number[][] {
  let final: number[][] = [];
  //TODO: Implement checker for the neighbors
  for (let i: number = 0; i < 4; i++) {
    let n: number[] = [a, b];
    n[i % 2] += ((Math.floor(i / 2) * 2) || -2);

    if (n[0] < maze.length &&
      n[1] < maze.length &&
      n[0] > 0 && n[1] > 0) {

      if (maze[n[0]][n[1]] == 1) {      // Replaces wall with empty space
        final.push(n);
      }
    }
  }
  return final;
}

function neighborsAB(maze: number[][], a: number, b: number): number[][] {
  //TODO: Implement method for coordinate checking (NOT the same as the method "neighbors"
  let final: number[][] = [];
  for (let i: number = 0; i < 4; i++) {             // Iterates through the 4 closest neighbors
    let n: number[] = [a, b];                   // (checks if they are reachable)
    n[i % 2] += ((Math.floor(i / 2) * 2) || -2);

    if (n[0] < maze.length &&            //Checks edge cases (corner, edge)
      n[1] < maze[0].length &&
      n[0] > 0 && n[1] > 0) {
      final.push(n);
    }
  }
  return final;
}

function complete(maze: number[][]): boolean {
  //TODO: Implement method for checking if the maze is "complete"
  for (let i: number = 1; i < maze.length; i += 2) {
    for (let j: number = 1; j < maze.length; j += 2) {
      if (maze[i][j] != 0) {
        return false;
      }
    }
  }
  return true;
}

function findCoordinate(maze: number[][]): number[][] {
  //TODO: Implement method for finding the coordinates for neighbors (basically where to go)
  for (let i: number = 1; i < maze.length; i += 2) {
    for (let j: number = 1; j < maze.length; j += 2) {
      if (maze[i][j] == 1) {
        const neighbor: number[][] = neighborsAB(maze, i, j);

        for (let k: number = 0; k < neighborsAB.length; k++) {
          if (maze[neighbor[k][0]][neighbor[k][1]] == 0) {
            return [[i, j], neighbor[k]];
          }
        }
      }
    }
  }
  return [[-1, -1], [-1, -1]];
}
