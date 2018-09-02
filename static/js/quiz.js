var quiz;
var quizStatus;
var question;

var renderQuestion = function(dataSocket) {
	quiz = document.getElementById("quiz")
	quizStatus = document.getElementById("quizStatus")

	quizStatus.innerHTML = "QUIZ'N'GOAL" + " - " + "Question " + (dataSocket.position + 1) + " sur " + dataSocket.nbquestions;
	question = dataSocket.question;
	var chA = dataSocket.choixReponse[0];
	var chB = dataSocket.choixReponse[1];
	var chC = dataSocket.choixReponse[2];

	quiz.innerHTML = "<h3>" + question + "</h3>";
	quiz.innerHTML = quiz.innerHTML + "<input type='radio' name='choices' value='A'> " + chA + "<br>";
	quiz.innerHTML = quiz.innerHTML + "<input type='radio' name='choices' value='B'> " + chB + "<br>";
	quiz.innerHTML = quiz.innerHTML + "<input type='radio' name='choices' value='C'> " + chC + "<br>";
}