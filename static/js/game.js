window.addEventListener("DOMContentLoaded", function() {

    var instructions = document.getElementById("instructions");
    instructions.style.opacity = 1;

    var player1 = new Player("firstplayer");
    var player2 = new Player("secondplayer");

    var start = function() {
        var intervalGame = setInterval(function() {
            player1.move(27, 58);
            player2.move(27, 58);
        },30);
    };
    start();

    var pause = function() {
        clearInterval(intervalGame);
    };
});