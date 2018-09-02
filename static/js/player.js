var Player = function(player) {
    var deplacement = 40;
    var moveTop = true;
    var that = this;

    this.player = document.getElementById(player);
    
    this.move = function(top, bot) {
        if (moveTop == true) {
            deplacement = deplacement - 1;
            that.player.style.top = deplacement + "%";
            if (deplacement <= top) {
                moveTop = false;
            }
        } else {
            if(moveTop == false) {
                deplacement = deplacement + 1;
                that.player.style.top = deplacement + "%";
                if (deplacement >= bot) {
                    moveTop = true;
                }
            }
        }
    };
};