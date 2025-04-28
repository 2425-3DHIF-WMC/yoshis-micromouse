function huntAndKill(width: number, height: number) : number[][]{

    width -= width % 2;
    width++;
    height -= height % 2;
    height++;

    let maze: number[][] = [];
    //TO_DO: Implement Hunt & Kill algorithm
    return maze;
}
function neighbors(maze: number[][], a: number, b: number): number[][] {
    let final: number[][] = [];
    //TO_DO: Implement checker for the neighbors
    for(let i: number = 0; i < 4; i++){
        let n: number[] = [a,b];
        n[i%2] += ((Math.floor(i / 2) * 2) || -2);

        if( n[0] < maze.length &&
            n[1] < maze.length &&
            n[0] > 0 && n[1] > 0){

            if(maze[n[0]][n[1]] == 1){      // Replaces wall with empty space
                final.push(n);
            }
        }
    }
    return final;
}

function neighborsAB(maze: number[][], a: number, b: number): number[][]{
    //TO_DO: Implement method for coordinate checking (NOT the same as the method "neighbors"
    let final: number[][] = [];
    for(let i: number = 0; i < 4; i++){             // Iterates through the 4 closest neighbors
        let n: number[] = [a, b];                   // (checks if they are reachable)
        n[i % 2] += ((Math.floor(i / 2) * 2) || -2);

        if(n[0] < maze.length &&            //Checks edge cases (corner, edge)
           n[1] < maze[0].length &&
            n[0] > 0 && n[1] > 0){
            final.push(n);
        }
    }
    return final;
}

function complete(maze: number[][]): boolean{
    //TO_DO: Implement method for checking if the maze is "complete"
    for(let i: number = 1; i < maze.length; i+= 2){
        for(let j: number = 1; j < maze.length; j+= 2){
            if(maze[i][j] != 0){
                return false;
            }
        }
    }
    return true;
}

function findCoordinate(maze: number[][]){
    //TO_DO: Implement method for finding the coordinates for neighbors (basically where to go)
    for(let i: number = 1; i < maze.length; i+=2){
        for(let j: number = 1; j < maze.length; j+=2){
            if(maze[i][j] == 1){
                const neighbor: number[][] = neighborsAB(maze, i, j);

                for(let k: number = 0; k < neighborsAB.length; k++){
                    if(maze[neighbor[k][0]][neighbor[k][1]] == 0){
                        return [[i,j], neighbor[k]];
                    }
                }
            }
        }
    }
}