const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const server = app.listen(process.env.PORT || 8000, function() {
    console.log("Ecoute sur le port " + process.env.PORT || 8000);
}); 
const io = require('socket.io')(server); 
var users = [

];

var playTime;
var currentGameSeconds = 0;

var correct = 0;
var pos = 0;

var questions = [
    ["Quel joueur de l'équipe de France a marqué un doublé contre l'Argentine ?", "Antoine Griezmann", "Kylian Mbappé", "Olivier Giroud", "B"],
    ["Quel fût l'adversaire des Bleus lors des quarts de final de la coupe du monde ?", "Le Brésil", "L'Allemagne", "L'Uruguay", "C"],
    ["Quel ancien joueur de génie était surnommé 'El pibe de oro' ?", "Diego Maradona", "Zinédine Zidane", "Pelé", "A"],
    ["En quelle année la France a-t-elle gagné la coupe du monde la première fois ?", "1998", "2000", "2004", "A"],
    ["Harry Kane est d'origine", "Marocaine", "Anglaise" , "Ecossaise", "B"],
    ["Quel joueur de l'équipe de France a mit un terme à sa carrière internationale suite à la coupe du monde ?", "Adil Rami", "Steve Mandanda" , "Olivier Giroud", "A"],
    ["Quel joueur du Brésil est-il réputé pour ses simulations à répétion ?", "Coutinho", "Neymar JR" , "Gabriel Jesus", "B"],
    ["Contre quelle équipe la Belgique c'est-elle qualifié pour les demi-finales ?", "Argentine", "Chilie" , "Japon", "C"],
    ["Qui est le joueur le plus jeune ayant participé à la coupe du monde 2018 ?", "Daniel Arzani", "Kylian Mbappé" , "Gianluigi Buffon", "A"],
    ["Combien de buts ont-ils été inscrits durant cette coupe du monde ?", "174", "137" , "169 ", "C"],
    ["Qui est le meilleur buteur de l'histoire de la coupe du monde ?", "Miroslav Klose", "Diego Maradona" , "Gerd Müller", "A"],
    ["Qui a été élu meilleur gardien de la coupe du monde 2018 ?", "Igor Akinfeïev", "Thibault Courtois" , "Hugo Lloris", "B"],
    ["Parmis ces joueurs lequel n'a jamais remporté de coupe du monde ?", "Stéphane Guivarc'h", "Paolo Rossi" , "Johan Cruyff", "C"],
    ["Parmis ces joueurs lequel a remporté la coupe du monde en tant que joueur puis en tant qu'entraîneur ?", "Roberto Baggio", "Michel Platini" , "Didier Deschamps", "C"],
    ["Qui est l'actuel entraineur du PSG ?", "Thomas Tuchel", "Laurent Blanc" , "Arsène Wenger", "A"],
    ["Lequel de ces clubs n'a jamais remporté la ligue des champions :", "Paris Saint-Germain", "Real Madrid" , "Aston Villa", "A"],
    ["Lequel de ces 3 joueurs n'est pas nominés pour remporter le prix PUSKAS cette année ?", "Dimitri Payet", "Cristiano Ronaldo" , "Eden Hazard", "C"],
    ["Sur quel score fleuve l'Allemagne a-t-elle terrasser le Brésil lors de la coupe du monde 2014 ?", "6 - 1", "7 - 1" , "8 - 1", "B"],
    ["En quelle année le Brésil a-t-il remporté sa dernière coupe du monde ?", "2002", "2006" , "1994", "A"],
    ["Quel international allemand a prit sa retraite à l'issu de la coupe du monde 2018 ?", "Bastien Schwensteiger", "Mesut Özil" , "Philippe Lahm", "B"]
];

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/static', express.static(__dirname + '/static'));

app.set('view engine', 'pug');
app.set('views', 'templates');

app.get('/', function(req, res) {
    res.render('index');
});

io.on('connection', function(webSocketConnection) {
    
    // -  C O N N E X I O N - //

    webSocketConnection.on('login', function(dataSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75@ds235022.mlab.com:35022/heroku_73b6fljf", function(err, database) {
            if(err) {
                return console.log("Erreur connection");
            }
    
            const myDb = database.db("heroku_73b6fljf");
            const collection = myDb.collection("users");
    
            //request.session.user = request.body.login
    
            collection.find().toArray(function(err, dataDB) {

                for(i = 0; i < dataDB.length; i++) {

                    if(dataSocket.login == dataDB[i].login && dataSocket.password == dataDB[i].password) { // - Vérification de la correspondance des logins - // 

                        if(users == false) {
                            users.push({id: webSocketConnection.id, login: dataSocket.login, score: 0, playtime: 0}); 
                            io.sockets.emit("ConnectionOK", 
                            { 
                            arrayOfUsers: users 
                            });
                            return
                        }

                        // - Vérification Serveur Full - // 

                        if(users.length == 2 && dataSocket.login == dataDB[i].login && dataSocket.password == dataDB[i].password) { 
                            webSocketConnection.emit("ServeurFullOnConnection", {message: "*Connexion refusée. Serveur full."})
                            return
                        }

                        // - Empêcher le joueur connecté en premier de générer une nouvelle connexion - //

                        if(users[0]) { // - Test si le pseudo inséré est différent de de celui de l'utilisateur déjà connecté et que son login et mdp sont bons - //
                            if(dataSocket.login !== users[0].login && dataSocket.login == dataDB[i].login && dataSocket.password == dataDB[i].password) { 
                                 users.push({id: webSocketConnection.id, login: dataSocket.login, score: 0, playtime: 0});
                            } else {
                                if(dataSocket.login == users[0].login) { // - Test si le pseudo inséré est le même que celui de l'utilisateur déjà connecté - //
                                    webSocketConnection.emit("StillConnected", {message: "*Vous êtes déjà connecté."})
                                    return
                                }
                            }
                        }
 
                        pos = 0;

                        // - Envoie du tableau d'utilisateur côté Front - //
                        io.sockets.emit("ConnectionOK", 
                        { 
                            arrayOfUsers: users 
                        });

                        // - Lancement de la partie quand il y a 2 utilisateurs dans le tableau d'users - //
                        if(users.length == 2) { 
                            pos = 0;

                            // - Timer enclenché en même temps que le lancement du quiz - //
                            playTime = setInterval(function timer() { 
                                currentGameSeconds = currentGameSeconds + 1;
                                io.sockets.emit("playTime", currentGameSeconds);
                            }, 1000);

                            return io.sockets.emit("makeQuiz", {message : ""});
                        }  
                    } 
                }

                webSocketConnection.emit("ConnectionError", {message: "*Connexion refusée. Login ou mot de passe incorrect."})
     
            });

        });  
    });

    // -  E N R E G I S T R E M E N T - //

    webSocketConnection.on('registration', function(dataSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75@ds235022.mlab.com:35022/heroku_73b6fljf", function(err, database) {
            if(err) {
                return console.log("Erreur ");
            } 

            if(dataSocket.login == "") {
                return webSocketConnection.emit("insertId", {message: "*Veuillez saisir un identifiant."})
            } else {
                if(dataSocket.password == "") {
                    return webSocketConnection.emit("insertPwd", {message: "*Veuillez saisir un mot de passe."})
                } else {
                    if(dataSocket.mail == "") {
                        return webSocketConnection.emit("insertMail", {message: "*Veuillez saisir un mail."})
                    }
                }
            }

            const myDb = database.db("heroku_73b6fljf");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) {
                if(!dataDB) return [];
                for(i = 0; i < dataDB.length; i++) {
                    if(dataSocket.login == dataDB[i].login) {
                        return webSocketConnection.emit("otherId", {message: "Ce pseudo est déjà pris. Choissisez un autre pseudo."})
                    } else {    
                        if(dataSocket.mail == dataDB[i].mail) {
                            return webSocketConnection.emit("otherMail", {message: "Cette adresse mail existe déjà."})    
                        } 
                    }
                }

                collection.insert({login: dataSocket.login, password: dataSocket.password, mail: dataSocket.mail, score: 0, playtime: 0});

                if(users.length < 2) { // - Insertion dans le tableau d'utilisateur si il est inférieur à 2 personnes - //
                    users.push({id: webSocketConnection.id, login: dataSocket.login, score: 0, playtime: 0});
                } else {
                    return webSocketConnection.emit("ServeurFullOnRegistration", {message: "Vous êtes inscrit mais le serveur est full."})    
                }

                io.sockets.emit("ConnectionOK", 
                { 
                    arrayOfUsers: users 
                });

                if(users.length == 2) { 
                    pos = 0;

                    // - Timer enclenché en même temps que le lancement du quiz - //
                    playTime = setInterval(function timer() { 
                        currentGameSeconds = currentGameSeconds + 1;
                        io.sockets.emit("playTime", currentGameSeconds);
                    }, 1000);

                    return io.sockets.emit("makeQuiz", {message : ""});
                }
            });  
        });
    });

    webSocketConnection.on('questionStatus', function(dataSocket) {
        io.sockets.emit("questionStatus", {
            position: pos,
            nbquestions: questions.length,
            question : questions[pos][0],
            choixReponse: [ questions[pos][1], questions[pos][2], questions[pos][3] ]
        });
    });

    // - U P D A T E  S C O R E - //
  
    var testUpdateScore = function(user, collection) {

        collection.find({login: user.login}).toArray(function(err, results) { // - La query cible tous le document qui a pour login : user.login - //
            if(err) {
                return console.log("Erreur app.js 205", err)
            }
                if(user.score >= results[0].score) {    // - Mise à jour du score dans la BDD uniquement si celui-ci est supérieur au score déjà enregistré - //  
                    collection.update({ login: user.login },
                        {$set : {score: user.score}}, function(err, data) {
                        if(err) {
                            console.log("Erreur :", err)  
                        } else {
                            //console.log(data);
                        }
                    });
                }
        });
    };

    // - V E R I F I C A T I O N  R E P O N S E  U T I L I S A T E U R - //

    webSocketConnection.on('checkAnswer', function(choice) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75@ds235022.mlab.com:35022/heroku_73b6fljf", function(err, database) {
            if(err) {
                return console.log("Erreur ");
            } 

            const myDb = database.db("heroku_73b6fljf");
            const collection = myDb.collection("users");
            
            if(choice == questions[pos][4]) {       
                for(var i = 0; i < users.length; i++) {
                    if(users[i].id == webSocketConnection.id) {

                        users[i].score++; 

                        testUpdateScore(users[i], collection);   
                    }                          
                }
            } 

            if(choice) {
                pos++; 
            }
                         
            io.sockets.emit("endQuestion", users); // - Envoie des données aux clients à la fin de chaque question pour permettre d'afficher le score à chaque tour - /
           
            if(pos >= questions.length) {
                pos = 0;
                clearInterval(playTime); // - Timer arrêter quand la partie est finit - //
                return io.sockets.emit("endGame", users);
            } 
        
            io.sockets.emit("questionStatus", {
                position: pos,
                nbquestions: questions.length,
                question : questions[pos][0],
                choixReponse: [ questions[pos][1], questions[pos][2], questions[pos][3] ]
            }); 
        });
    });

    // - C L A S S E M E N T  T O P 1 0  - //

    webSocketConnection.on('rankingHighScores', function() {
        MongoClient.connect("mongodb://jessmani:azertyuiop75@ds235022.mlab.com:35022/heroku_73b6fljf", function(err, database) {
            if(err) {
                return console.log("Erreur connection");
            }
       
            const myDb = database.db("heroku_73b6fljf");
            const collection = myDb.collection("users");

            collection.find({}).sort({score: -1}).limit(10).toArray(function(err, dataDB) {
                console.log('*** dataDB ***', dataDB)
                var sendRanking = function(rank, indice)  { 
                    if(dataDB && dataDB[indice]) {
                        io.sockets.emit(rank, {
                            login: dataDB[indice].login,                                                       
                            score: dataDB[indice].score,
                            playtime: dataDB[indice].playtime
                        })
                    }
                }

                sendRanking("first", 0);
                sendRanking("second", 1);
                sendRanking("third", 2);
                sendRanking("fourth", 3);
                sendRanking("fifth", 4);
                sendRanking("sixth", 5);
                sendRanking("seventh", 6);
                sendRanking("eighth", 7);
                sendRanking("ninth", 8);
                sendRanking("tenth", 9);
            })
        })
    })

    webSocketConnection.on('disconnect', function() {
        MongoClient.connect("mongodb://jessmani:azertyuiop75@ds235022.mlab.com:35022/heroku_73b6fljf", function(err, database) {
            if(err) {
                return console.log("Erreur connection");
            }

            const myDb = database.db("heroku_73b6fljf");
            const collection = myDb.collection("users");
        
            for(var i = 0; i < users.length; i++) { 

                // - Remise à 0 du score en cas de déconnexion d'un des 2 joueurs - //
                users[0].score = 0
                if(users[1]) {
                    users[1].score = 0
                }
               

                if(users[i].id == webSocketConnection.id) {  
                    io.sockets.emit("opponentDisconnected", { 
                        opponentDisconnected: users[i].login, 
                        scorePlayer1: users[0].score, 
                        scorePlayer2: users[1] ? users[1].score : null // condition ? vrai : faux - Condition ternaire pour éviter l'erreur de boucle si l'user[1] n'existe pas.
                    }) 

                    clearInterval(playTime);    // - Arrêt du timer quand un des 2 joueurs se déconnectent - //
        

                    // -  M.A.J  D U  T E M P S  D E  J E U - //

                    users[0].playtime = currentGameSeconds;
                    
                    if(users[1]) {                     
                        users[1].playtime = currentGameSeconds;
                    }

                    collection.find().toArray(function(err, dataDB) {
                        for(j = 0; j < dataDB.length; j++) {
                            
                            if(users[0]) { 
        
                                if(users[0].login == dataDB[j].login) {
                                    collection.update({ login: users[0].login },
                                        {$set : {playtime: users[0].playtime + dataDB[j].playtime}}, function(err, data) { 
                                        if(err) {
                                            console.log("Erreur :", err)  
                                        } else {
                                            //console.log(data);
                                        }
                                    });
                                } 
                            }
                    
                            if(users[1]) {

                                if(users[1].login == dataDB[j].login) {
                                    collection.update({ login: users[1].login },
                                        {$set : {playtime: users[1].playtime + dataDB[j].playtime}}, function(err, data) { // callback
                                        if(err) {
                                            console.log("Erreur :", err)  
                                        } else {
                                            //console.log(data);
                                        }
                                    });
                                }
                            }      
                        }    
                    })
 
                    var indiceP1 = 0; 
                    var indiceP2 = 1;
                    
                    currentGameSeconds = 0; // - Remise à 0 du compteur quand un des joueurs se déconnectent - //

                    if(users[0].id == webSocketConnection.id) { // Palier au fait que la boucle se finisse (users.length) avant que le setTimeout ai le temps de faire le splice
                        setTimeout(function() { // éviter que le callback soit executé après le splice, si je ne met pas de setTimeout le callback lié à l'user 1 se lance après le splice
                        users.splice(indiceP1, 1); 
                        }, 200);
                    } else {
                        if(users[1].id == webSocketConnection.id) {
                            setTimeout(function() { // éviter que le callback soit executé après le splice
                            users.splice(indiceP2, 1); 
                            }, 400);   
                        }
                    }
                    pos = 0; 
                }
            }
        });
    });
}); 