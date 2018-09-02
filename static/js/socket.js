window.addEventListener('DOMContentLoaded', function() {

    // - V A R I A B L E S - //
    var webSocketConnection = io("https://quizngoal.herokuapp.com/");
    var connectionForm = document.getElementById("connectionForm");
    var registrationForm = document.getElementById("registrationForm");
    var playTime;
    var hours;
    var minutes;
    var seconds;
    var totalSeconds = 0;

    // - V E R I F I C A T I O N  R E P O N S E  U T I L I S A T E U R - //
    var checkAnswer = document.getElementById("checkAnswer");

    checkAnswer.addEventListener('click', function(event) { // - Au clique sur le bouton j'envoie un message côté back avec la réponse de l'utilisateur - //
        event.preventDefault();

        var choices = document.getElementsByName("choices");

        for(var i = 0; i < choices.length; i++){
            if(choices[i].checked) {
                var choice = choices[i].value;
            }
        }

        webSocketConnection.emit('checkAnswer', choice) // - Envoie de la réponse de l'utilisateur au Back - //
    });

    var makeQuiz = function() {
        webSocketConnection.on('makeQuiz', function(dataFromServer) {
            var quiz = document.getElementById("quiz");
            quiz.style.display = "block";
            quiz.style.opacity = 0.8;
            quiz.style.position = "absolute";
            quiz.style.left = "0";
            quiz.style.right = "0";
            quiz.style.marginTop = "20%";
            //quiz.style.marginLeft = "28%";

            var quizStatus = document.getElementById("quizStatus");
            quizStatus.style.display = "block";
            quizStatus.style.position = "absolute";
            quizStatus.style.marginTop = "10%";
            quizStatus.style.left = "0";
            quizStatus.style.right = "0";
        });    
    };

    webSocketConnection.on('playTime', function(totalSeconds) {
        document.getElementById("timer").innerHTML = totalSeconds;
    })

    var connectionOk = function() {     // - Si la connexion est validé - //
        webSocketConnection.on('ConnectionOK', function(dataFromServer) {     
            var connection = document.getElementById("connection");
            connection.style.display = "none";

            var title = document.getElementById("title");
            title.style.display = "none";

            var instruction = document.getElementById("instructions");
            instructions.style.display = "block";
            instructions.innerHTML = "Bienvenue sur Quiz'N'Goal." + "<br> Répondez le plus rapidement possible aux questions !";

            var playerOneTitle = document.getElementById("playerOneTitle");
            playerOneTitle.style.display = "block";
            playerOneTitle.innerHTML = dataFromServer.arrayOfUsers[0].login;

            var playerOneAvatar = document.getElementById("playerOneAvatar");
            playerOneAvatar.style.display = "block";

            var playerOneScore = document.getElementById("playerOneScore"); 
            playerOneScore.style.display = "block"; 
            playerOneScore.innerHTML = 0;

            var disconnected = document.getElementById("disconnected");
            disconnected.style.display = "none";
           
            if(dataFromServer.arrayOfUsers.length == 2) {
                var playerTwoTitle = document.getElementById("playerTwoTitle");
                playerTwoTitle.style.display = "block";
                playerTwoTitle.innerHTML = dataFromServer.arrayOfUsers[1].login;

                var playerTwoAvatar = document.getElementById("playerTwoAvatar");
                playerTwoAvatar.style.display = "block";

                var playerTwoScore = document.getElementById("playerTwoScore"); 
                playerTwoScore.style.display = "block";  
                playerTwoScore.innerHTML = 0;
                
                var checkAnswer = document.getElementById("checkAnswer");
                checkAnswer.style.display = 'block';
                checkAnswer.style.position = "absolute";
                checkAnswer.style.top = "40%";
                checkAnswer.style.left = "75%";
                checkAnswer.style.width = "13%";
                checkAnswer.style.height = "20%";
                checkAnswer.style.borderStyle = "solid";
                checkAnswer.style.color = "white";
                checkAnswer.style.backgroundColor = "red";
                checkAnswer.style.borderColor = "red";
                checkAnswer.style.borderRadius = "50%";
                
            }
        });
    };

    var questionStatus = function() {
        webSocketConnection.on('questionStatus', function(dataFromServer) {
            renderQuestion(dataFromServer);
        });
    }; 

    var endQuestion = function() {
        webSocketConnection.on('endQuestion', function(users) {
            var playerOneScore = document.getElementById("playerOneScore");  
            playerOneScore.innerHTML = users[0].score  // - > nombre de bonne réponse du joueur 1

            var playerTwoScore = document.getElementById("playerTwoScore");  
            playerTwoScore.innerHTML = users[1].score  // - > nombre de bonne réponse du joueur 1
        });
    };

    var endGame = function() {
        webSocketConnection.on('endGame', function(users) {
            var instruction = document.getElementById("instructions");
            instructions.style.display = "block";
            if(users[0].score > users[1].score) {
                instructions.innerHTML = "FIN DE LA PARTIE - " + users[0].login + " a gagné !";
            } else {
                if(users[1].score > users[0].score) {
                    instructions.innerHTML = "FIN DE LA PARTIE - " + users[1].login + " a gagné !";
                } else {
                    instructions.innerHTML = "FIN DE LA PARTIE - " + " EGALITE" ;
                }
            }
            quiz.style.display = "none";
            checkAnswer.style.display = "none";
            quizStatus.style.display = "none";
        });
    }

    // - C L A S S E M E N T  T O P 1 0  - //

    webSocketConnection.emit('rankingHighScores', {})

    var convertSeconds = function(playtime) {
        hours = Math.floor(playtime / 3600) ;
        minutes = Math.floor((playtime - hours * 3600) / 60);
        seconds = playtime - (hours * 3600 + minutes * 60);
    }

    var rankingPodium = function(rank, id, scoreandplaytime) {
        webSocketConnection.on(rank, function(dataFromServer) {

            document.getElementById(id).style.position = "absolute";
            document.getElementById(scoreandplaytime).style.position = "absolute";

            convertSeconds(dataFromServer.playtime);

            document.getElementById(id).innerHTML = dataFromServer.login;
            document.getElementById(scoreandplaytime).innerHTML = "Score : " + "" + dataFromServer.score +  " / " + " Temps de jeu : " + hours + "h " + minutes + "mn " + seconds + "s";
        }) 
    }

    var ranking = function(rank, id) {
        webSocketConnection.on(rank, function(dataFromServer) {
    
            document.getElementById(id).style.position = "absolute";

            convertSeconds(dataFromServer.playtime);

            document.getElementById(id).innerHTML = rank + " * " + dataFromServer.login  + " / " + " Score : " + "" + dataFromServer.score +  " / " + " Temps de jeu : " +hours + "h " + minutes + "mn " + seconds + "s";
        })  
    }

    rankingPodium("first", "first", "scoreandplaytime1st")
    rankingPodium("second", "second", "scoreandplaytime2nd");
    rankingPodium("third", "third", "scoreandplaytime3rd");
    ranking("fourth", "fourth");
    ranking("fifth", "fifth");
    ranking("sixth", "sixth");
    ranking("seventh", "seventh");
    ranking("eighth", "eighth");
    ranking("ninth", "ninth");
    ranking("tenth", "tenth");

    var oppononentDisconnected = function() {
        webSocketConnection.on('opponentDisconnected', function(dataFromServer) {
            var disconnected = document.getElementById("disconnected");
            disconnected.style.display = "block";
            disconnected.innerHTML = dataFromServer.opponentDisconnected + " s'est deconnecté ! Fin de la partie"

            var playerOneTitle = document.getElementById("playerOneTitle");
            var playerOneAvatar = document.getElementById("playerOneAvatar");
           
            var playerTwoTitle = document.getElementById("playerTwoTitle");
            var playerTwoAvatar = document.getElementById("playerTwoAvatar");

            var playerOneScore = document.getElementById("playerOneScore");  
            playerOneScore.innerHTML = dataFromServer.scorePlayer1 // - Nombre de bonne réponse du joueur 1 - // 

            var playerTwoScore = document.getElementById("playerTwoScore");  
            playerTwoScore.innerHTML = dataFromServer.scorePlayer2  // - Nombre de bonne réponse du joueur 2 - // 

            if(dataFromServer.opponentDisconnected == playerOneTitle.innerHTML) { // - Si le login de l'utilisateur déconnecté correspond au pseudo du joueur 1 - //
                playerOneTitle.innerHTML = "";
                playerOneAvatar.style.display = "none";
                playerOneScore.style.display = "none";
            } else {
                playerTwoTitle.innerHTML = "";
                playerTwoAvatar.style.display = "none";
                playerTwoScore.style.display = "none";
            }

            instructions.style.display = "none";
            quiz.style.display = "none";
            checkAnswer.style.display = "none";
            quizStatus.style.display = "none";
        });
    }
    
    // - F O R M U L A I R E  D E  C O N N E X I O N  - //

    connectionForm.addEventListener("submit", function(event) {
        event.preventDefault();

        webSocketConnection.emit('login', {
            login: document.getElementById("loginConnection").value, 
            password: document.getElementById("passwordConnection").value
        });

        var users = {
            connected: "est connecté" 
        };

        webSocketConnection.emit('connected', users.connected)

        webSocketConnection.on("ConnectionError", function(dataFromServer) {
            var messageError = document.getElementById("connectionerror");
            messageError.style.display = "block";
            messageError.innerHTML = dataFromServer.message; 
        });

        webSocketConnection.on("StillConnected", function(dataFromServer) {
            var stillConnected = document.getElementById("stillconnected");
            stillConnected.style.display = "block";
            stillConnected.innerHTML = dataFromServer.message; 
        });

        webSocketConnection.on("ServeurFullOnConnection", function(dataFromServer) {
            var messageError = document.getElementById("serveurfull");
            messageError.style.display = "block";
            messageError.innerHTML = dataFromServer.message; 
        }); 

       webSocketConnection.on("CantPlay", function(dataFromServer) {
            var playerOneScore = document.getElementById("playerOneScore");
            playerOneScore.style.display = "none";

            var playerTwoScore = document.getElementById("playerTwoScore");
            playerTwoScore.style.display = "none";

            var disconnected = document.getElementById("disconnected");
            disconnected.style.display = "none";

            var cantPlay = document.getElementById("cantplay");
            cantPlay.style.display = "block";
            cantPlay.innerHTML = dataFromServer.message;
        });

        webSocketConnection.emit('questionStatus', {});

        connectionOk();
        makeQuiz();
        questionStatus();
        endQuestion();  
        endGame(); 
        oppononentDisconnected();
    });

    // - F O R M U L A I R E  D ' I N S C R I P T I O N  - //

    var messageError = function(action) {
        webSocketConnection.on(action, function(dataFromServer) {
            var messageErrorID = document.getElementById("registrationerror");
            messageErrorID.style.display = "block";
            messageErrorID.innerHTML = dataFromServer.message;
        });
    }

    registrationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        webSocketConnection.emit('registration', {
            login: document.getElementById("loginRegistration").value, 
            password: document.getElementById("passwordRegistration").value,
            mail: document.getElementById("emailRegistration").value
        });

        messageError("insertId");
        messageError("insertPwd");
        messageError("insertMail");
        messageError("otherId");
        messageError("otherMail");
        messageError("ServeurFullOnRegistration");

        webSocketConnection.emit('questionStatus', {});

        connectionOk();
        makeQuiz();
        questionStatus();
        endQuestion();
        endGame(); 
        oppononentDisconnected();
    });
});