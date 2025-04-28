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
    return final;
}

function neighborsAB(maze: number[][], a: number, b: number): number[][]{
    let final: number[][] = [];
    //TO_DO: Implement method for coordinate checking (NOT the same as the method "neighbors"
    return final;
}

function complete(maze: number[][]): boolean{
    //TO_DO: Implement method for checking if the maze is "complete"
    return true;
}

function findCoordinate(maze: number[][]){
    //TO_DO: Implement method for finding the coordinates for neighbors (basically where to go)
    return maze;
}