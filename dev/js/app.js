'use strict';
var tetris          = require('./tetris');

function ready(){
    document.removeEventListener( 'DOMContentLoaded', ready, false );
    window.removeEventListener( 'load', ready, false );

    var width = window.innerWidth,
        boards = ~~((window.innerWidth/20)/10),
        bWidth = 20 * Math.round((width/10)/20),
        tetrisInstances = [];

    for(var w = 0; w < boards; w++){
        console.log(20 * Math.round((w*bWidth)/20));
        tetrisInstances.push(new tetris(20 * Math.round((w*bWidth)/20), 0, bWidth));
    }
}

document.addEventListener( 'DOMContentLoaded', ready, false );
window.addEventListener( 'load', ready, false );