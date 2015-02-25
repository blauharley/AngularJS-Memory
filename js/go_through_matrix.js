
var workerScript;
var workerMethod;

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

(function(){

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

    function getDutyCyleMsg(duty){
        switch(duty){
            case 100:
                return 'Treffer (Sehr Stark)';
            case 80:
                return 'Unmittelbarer Umkreiß (Stark)';
            case 60:
                return 'In der Nähe (Mittel)';
            case 40:
                return 'Eher kalt (Schwach)';
            case 20:
                return 'Ganz kalt (Sehr Schwach)';
            default:
                return 'Weit und Breit nichts!';
        };
    }

    function queryRaspberryPin($http, $scope, $timeout, duty){

        var pinNr = 6;

        $scope.dutyMsg = getDutyCyleMsg(duty);
        $scope.dutyMsgShow = true;

        /* raspberry deactivated by default
        $http.get('/angularjs/php/led-duty.php?pin='+pinNr+'&start='+duty, {}).
            success(function(data, status, headers, config) {

                $timeout(function(){
                  $scope.dutyMsgShow = false;
                },4000)

                console.log('reaspberry success');

            }).
            error(function(data, status, headers, config) {
                alert('Raspberry-Error: '+status);
            });
                */
    }

    var worker;

    workerScript = {

        init: function(file){
            worker = new Worker(file);
        },

        // drop into water
        goThroughMatrix : function(arr, start, end, $timeout, width, turns){

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

                workerScript.goThroughMatrix(arr, start, end, $timeout, width + 1, turns-1);

            }

        },

        callDutyCyleForRaspberry: function(arr, start, end, $http, $scope, $timeout, width, turns){

                if(arr[end] && arr[end][start] && arr[end][start].counterpart){
                    queryRaspberryPin($http, $scope, $timeout, 100);
                    return;
                }

                width = width == undefined ? 1 : width;
                turns = turns == undefined ? getMaxStepLength(start, end, arr.length) : turns;

                if(turns){

                    worker.postMessage(width);

                    worker.onmessage = function(e){

                        var dirs = e.data;

                        var x = start;
                        var y = end;

                        for(var d=0; d < dirs.length; d++){

                           var dir = dirs[d];

                           x += dir[0];
                           y += dir[1];

                           if(arr[y] && arr[y][x] && arr[y][x].counterpart && !arr[y][x].disabled){
                                var callDuty = 100 - (width*20);
                                callDuty = callDuty > 0 ? callDuty : 0;
                                console.log(callDuty);
                                queryRaspberryPin($http, $scope, $timeout, callDuty);
                                return;
                           }

                        }

                        workerScript.callDutyCyleForRaspberry(arr, start, end, $http, $scope, $timeout, width + 1, turns-1);

                    };

                }

        }

    };

    workerMethod = function(e){

        var width = e.data;

        var dirs = getDirsByWidth(width);

        postMessage(dirs);

    };

})();

onmessage = workerMethod;
