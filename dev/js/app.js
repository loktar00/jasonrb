'use strict';
var tetris          = require('./tetris');

function ready(){
    document.removeEventListener( "DOMContentLoaded", ready, false );
    window.removeEventListener( "load", ready, false );

    tetris();
}

document.addEventListener( "DOMContentLoaded", ready, false );
window.addEventListener( "load", ready, false );