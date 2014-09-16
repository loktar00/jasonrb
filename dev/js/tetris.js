var tetrominos = [{
    // box
    colors : ["rgb(59,84,165)", "rgb(118,137,196)", "rgb(79,111,182)"],
    data : [[0, 0, 0, 0],
         [0, 1, 1, 0],
         [0, 1, 1, 0],
         [0, 0, 0, 0]]
    },
    {
    // stick
    colors : ["rgb(214,30,60)", "rgb(241,108,107)", "rgb(236,42,75)"],
    data : [[0, 0, 0, 0],
         [0, 0, 0, 0],
         [1, 1, 1, 1],
         [0, 0, 0, 0]]
    },
    {
    // z
    colors : ["rgb(88,178,71)", "rgb(150,204,110)", "rgb(115,191,68)"],
    data : [[0, 0, 0, 0],
         [0, 1, 1, 0],
         [0, 0, 1, 1],
         [0, 0, 0, 0]]
    },
    {
    // T
    colors : ["rgb(62,170,212)", "rgb(120,205,244)", "rgb(54,192,240)"],
    data : [[0, 0, 0, 0],
         [0, 1, 1, 1],
         [0, 0, 1, 0],
         [0, 0, 0, 0]]
    },
    {
    // s
    colors : ["rgb(236,94,36)", "rgb(234,154,84)", "rgb(228,126,37)"],
    data : [[0, 0, 0, 0],
         [0, 1, 1, 0],
         [1, 1, 0, 0],
         [0, 0, 0, 0]]
    },
    {
    // backwards L
    colors : ["rgb(220,159,39)", "rgb(246,197,100)", "rgb(242,181,42)"],
    data : [[0, 0, 1, 0],
          [0, 0, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0]]
    },
    {
    // L
    colors : ["rgb(158,35,126)", "rgb(193,111,173)", "rgb(179,63,151)"],
    data : [[0, 1, 0, 0],
         [0, 1, 0, 0],
         [0, 1, 1, 0],
         [0, 0, 0, 0]]
    }],
    curPiece = {
        data : null,
        colors : [0,0,0],
        x : 0,
        y : 0,
    },
    lastMove = Date.now(),
    curSpeed = 400,
    unitSize = 20,
    linesCleared = 0,
    level = 0,
    loseBlock = 0;

var canvas = document.querySelector("#bg-canvas"),
    ctx = canvas.getContext("2d"),
    fgCanvas = document.querySelector("#fg-canvas"),
    fgCtx = fgCanvas.getContext("2d");

    canvas.width = fgCanvas.width = window.innerWidth;
    canvas.height = fgCanvas.height = window.innerHeight;

var board = [],
    boardWidth = Math.floor(canvas.width / unitSize),
    boardHeight = Math.floor(canvas.height / unitSize);

function init(){
    var halfHeight = boardHeight/2;

    loseBlock = 0;
    curSpeed = 400;
    linesCleared = 0;
    curPiece = {
        data : null,
        colors : [0,0,0],
        x : 0,
        y : 0,
    };

    // init board
    for (var x = 0; x < boardWidth; x++) {
        board[x] = [];
        for (var y = 0; y < boardHeight; y++) {

             board[x][y] = {
                data: 0,
                colors: ["rgb(0,0,0)", "rgb(0,0,0)", "rgb(0,0,0)"]
            };

            if(Math.random() > 0.15 && y > halfHeight){
                board[x][y] = {
                    data: 1,
                    colors: tetrominos[Math.floor(Math.random() * tetrominos.length)].colors
                };
            }
        }
    }

    // collapse the board a bit
    for (var x = 0; x < boardWidth; x++) {
        for (var y = boardHeight-1; y > -1; y--) {

            if(board[x][y].data === 0 && y > 0){
                for(var yy = y; yy > 0; yy--){
                    if(board[x][yy-1].data){

                        board[x][yy].data = 1;
                        board[x][yy].colors = board[x][yy-1].colors;

                        board[x][yy-1].data = 0;
                        board[x][yy-1].colors = ["rgb(0,0,0)", "rgb(0,0,0)", "rgb(0,0,0)"];
                          
                    }
                } 
            }
        }
    }

    // render the board
    checkLines();
    renderBoard();

    // assign the first tetri
    newTetromino();

    update();
}

function update() {
   if (!checkMovement(curPiece, 0, 1)) {
       if (curPiece.y < -1) {
           // you lose
           loseScreen();
           return true;
       } else {
           fillBoard(curPiece);
           newTetromino();
       }
   } else {
       if (new Date().getTime() > lastMove) {
           lastMove = new Date().getTime() + curSpeed;
           if (checkMovement(curPiece, 0, 1)) {
               curPiece.y++;
           } else {
               fillBoard(curPiece);
               newTetromino();
           }
       }
   }

   render();
   requestAnimationFrame(update);
}

// Just render the board.
function renderBoard(){
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   for (var x = 0; x < boardWidth; x++) {
       for (var y = 0; y < boardHeight; y++) {
           if (board[x][y].data !== 0) {
                var bX = (x * unitSize),
                    bY = (y * unitSize);

                ctx.fillStyle = board[x][y].colors[0];
                ctx.fillRect(bX, bY, unitSize, unitSize);

                ctx.fillStyle = board[x][y].colors[1];
                ctx.fillRect(bX+2, bY+2, unitSize-4, unitSize-4);

                ctx.fillStyle = board[x][y].colors[2];
                ctx.fillRect(bX+4, bY+4, unitSize-8, unitSize-8);
           }
       }
   }
}

// Just render the current active piece
function render() {
    fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);

    for (var x = 0; x < 4; x++) {
       for (var y = 0; y < 4; y++) {
           if (curPiece.data[x][y] === 1) {
               var xPos = ((curPiece.x + x) * unitSize),
                   yPos = ((curPiece.y + y) * unitSize);

               if (yPos > - 1) {
                    fgCtx.fillStyle = curPiece.colors[0];
                    fgCtx.fillRect(xPos, yPos, unitSize, unitSize);

                    fgCtx.fillStyle = curPiece.colors[1];
                    fgCtx.fillRect(xPos+2, yPos+2, unitSize-4, unitSize-4);

                    fgCtx.fillStyle = curPiece.colors[2];
                    fgCtx.fillRect(xPos+4, yPos+4, unitSize-8, unitSize-8);
               }
           }
       }
    }

   //ctx.fillText("Lines Cleared : " + linesCleared, 260, 100);
   //ctx.fillText("Level : " + level, 260, 120);
}

// Make sure we can mov where we want.
function checkMovement(curPiece, newX, newY) {
   var piece = curPiece.data,
       posX = curPiece.x,
       posY = curPiece.y;

   for (var x = 0; x < 4; x++) {
       for (var y = 0; y < 4; y++) {
           if (piece[x][y] === 1) {

               if (!board[posX + x + newX]) {
                   board[posX + x + newX] = [];
               }

               if (!board[posX + x + newX][y + posY + newY]) {
                   board[posX + x + newX][y + posY + newY] = {
                       data: 0
                   };
               }

               if (posX + x + newX > boardWidth || posX + x + newX < 0 || board[posX + x + newX][y + posY + newY].data == 1) {
                   return false;
               }

               if (posY + y + newY > boardHeight-1) {
                   return false;
               }

           }
       }
   }
   return true;
}

// checks for completed lines and clears them
function checkLines() {
   var y = boardHeight;

   while (y--) {
       var x = boardWidth,
           lines = 0;

       while (x--) {
           if (board[x][y].data === 1) {
               lines++;
           }
       }

       if (lines === boardWidth) {
           linesCleared++;
           level = Math.round(linesCleared / 20) * 20;

           var lineY = y;
           while (lineY) {
               for (var x = 0; x < boardWidth; x++) {
                   if (lineY - 1 > 0) {
                       board[x][lineY].data = board[x][lineY - 1].data;
                       board[x][lineY].colors = board[x][lineY - 1].colors;
                   }
               }
               lineY--;
           }
           y++;
       }
   }
}

// Lose animation
function loseScreen() {
    var y = boardHeight - loseBlock;

    for(var x = 0; x < boardWidth; x++){
        var bX = (x * unitSize),
            bY = (y * unitSize);

        ctx.fillStyle = "rgb(80,80,80)";
        ctx.fillRect(bX, bY, unitSize, unitSize);

        ctx.fillStyle = "rgb(150,150,150)";
        ctx.fillRect(bX+2, bY+2, unitSize-4, unitSize-4);

        ctx.fillStyle = "rgb(100,100,100)";
        ctx.fillRect(bX+4, bY+4, unitSize-8, unitSize-8);
    }



    if(loseBlock <= (boardHeight+1)){
        loseBlock++;
        requestAnimationFrame(loseScreen);
    }else{
        init();
    }
}

// adds the piece as part of the board
function fillBoard(curPiece) {
    var piece = curPiece.data,
        posX = curPiece.x,
        posY = curPiece.y;

    for (var x = 0; x < 4; x++) {
       for (var y = 0; y < 4; y++) {
           if (piece[x][y] === 1) {
               board[x + posX][y + posY].data = 1;
               board[x + posX][y + posY].colors = curPiece.colors;
           }
       }
    }
    checkLines();
    renderBoard();
}

// rotate a piece
function rotateTetrimono(curPiece) {
   var rotated = [];

   for (var x = 0; x < 4; x++) {
       rotated[x] = [];
       for (var y = 0; y < 4; y++) {
           rotated[x][y] = curPiece.data[3 - y][x];
       }
   }

   if (!checkMovement({
       data: rotated,
       x: curPiece.x,
       y: curPiece.y
   }, 0, 0)) {
       rotated = curPiece.data;
   }

   return rotated;
}

// assign the player a new peice
function newTetromino() {
   var pieceNum = Math.floor(Math.random() * tetrominos.length);
   curPiece.data    = tetrominos[pieceNum].data;
   curPiece.colors  = tetrominos[pieceNum].colors;
   curPiece.x       = Math.floor(Math.random()*(boardWidth-curPiece.data.length-0+1));
   curPiece.y       = -4;
}

// key events
window.onkeydown = function (e) {
   switch (e.keyCode) {
       case 37:
           if (checkMovement(curPiece, -1, 0)) {
               curPiece.x--;
           }
           break;
       case 39:
           if (checkMovement(curPiece, 1, 0)) {
               curPiece.x++;
           }
           break;
       case 40:
           if (checkMovement(curPiece, 0, 1)) {
               curPiece.y++;
           }
           break;
       case 32:
           curPiece.data = rotateTetrimono(curPiece);
           break;
   }
}


module.exports = init;