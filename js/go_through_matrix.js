
function getDirsByWidth(width){

    var oneStepdirs = [[0,-1], [1,0], [0,1], [0,1], [-1,0], [-1,0], [0,-1], [0,-1]];

    var dirs = [];

    for(var d=0; d < oneStepdirs.length; d++){

       var currWidth = width;
       var currOneStep = oneStepdirs[d];

       while(currWidth){

          dirs.push(Array.prototype.slice.call(currOneStep));
          currWidth--;
       }

    }

    if(width-1){

       var currWidth = width-1;

       while(currWidth){

          dirs.push(Array.prototype.slice.call([1,0]));
          currWidth--;
       }

    }

    return dirs;

}

function getMaxStepLength(start, end, width){
    return Math.max(start, end, width-start, width-end);
}

function goThroughMatrix(arr, start, end, $timeout, width, turns){

  width = width == undefined ? 1 : width;
  turns = turns == undefined ? getMaxStepLength(start, end, arr.length) : turns;

  if(turns){

    var dirs = getDirsByWidth(width);

    var x = start;
    var y = end;

    for(var d=0; d < dirs.length; d++){

       var dir = dirs[d];

       x += dir[0];
       y += dir[1];

       if(arr[y] && arr[y][x]){

          if(!arr[y][x].doNotBlink && !arr[y][x].blink){
            arr[y][x].blink = true;
          }

          (function(x,y){
            $timeout(function(){
                arr[y][x].blink = false;
            },500);
          })(x,y);
       }

    }

    goThroughMatrix(arr, start, end, $timeout, width + 1, turns-1);

  }

}

function printMatrix(arr){

    var print = '';

    for(var d=0; d < arr.length; d++){
       for(var s=0; s < arr[d].length; s++){
           print += arr[d][s];
       }
       print += '\n';
    }

    console.log(print);

}

//printMatrxi(array);
//goThroughMatrix(array, 1,1);


//printMatrix(array);

// 1 2 3
// 4 5 6
// 7 8 9

// 1 2 3 4 5 6
// 7  8  9  10 11 12
// 13 14 15 16 17 18
// 19 20 21 22 23 24
// 25 26 27 28 29 30
// 31 32 33 34 35 36
