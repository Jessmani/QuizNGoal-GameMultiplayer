window.addEventListener("DOMContentLoaded", function() {

var title = document.getElementById("title");
title.style.width = "10%";
//var instructions = document.getElementById("instructions");
//var titleWidth = 20;

    var zoomTitle = function() {
        //instructions.style.opacity = 0;
        // titleWidth = titleWidth + 1;
        // title.style.width = titleWidth + "%";
        title.style.width = (parseFloat(title.style.width) + 1) + "%"; 
        //console.log(title.style.width)
        if(title.style.width >= "30%") {
            title.style.width = "30%";
            title.style.animationDuration = "0s";
            //instructions.style.opacity = 1;
        }
    };

    var player1 = new Player("firstplayer");
    var player2 = new Player("secondplayer");

    var start = function() {
        var intervalGame = setInterval(function() {
            player1.move(27, 58);
            player2.move(27, 58);
            zoomTitle();
        },30);
    };
    start();

    var pause = function() {
        clearInterval(intervalGame);
    };
});