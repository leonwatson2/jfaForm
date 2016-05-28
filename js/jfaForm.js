
function jfaForm($f){
	//fix margin between select questions
	//add side bar 
	//add footer
	//add on change of select
	//add focus next input
	//update footer progress
	if($f.id != undefined){

		if($f.questions.length < 1){
			jfaWarn("There are no questions.")
			return;
		}
		this.id = $f.id;
		this.welcome = $f.welcome;
		this.questions = $f.questions;
		this.thanks = $f.thanks;
		this.nextButtonText = $f.nextButtonText;
		this.submitButtonText = $f.submitButtonText;
		this.length = $f.questions.length;
		this.print = jfaPrint;
		this.init = jfaSetHtml;
		this.quesElements = [];
		this.currentQuestion = 0;
		this.goToQuestion = jfaGoToQuestion;
		this.init();
	} else {
		jfaWarn("No id was entered for JfaForm.");
	}


	
}	

//visual
function jfaGoToQuestion(num){
	num = num != undefined ? num : this.currentQuestion;
	 	
	
	if(num != this.length){

		$curScroll = $("#" + this.id).scrollTop();
		$("#" + this.id).animate({
			scrollTop : $curScroll + this.quesElements[num].offset().top
		});
	}
	

}



function jfaSetHtml(){
	$f = this;
	$container = $("#"+ $f.id);
	$submitBtn = $("<button>", {id:$f.id + "-submit", class:"submit", type:"submit", text:$f.submitButtonText});
	$footer = jfaGetFooterHtml();
	$container.addClass("jfa-form open");
	$items = [];


		$f.questions.forEach(jfaCreateQuestionStructure);


		$ulQuestions = $('<ul>', {class:"questions"});
		$items.forEach(function(item){
			$ulQuestions.append(item);
		});

		$ulQuestions.append($submitBtn);


		$container.html($ulQuestions);
		$container.append($footer);



	}
	
	function jfaCreateQuestionStructure(ques, index, arr){
		$thisQuestion = $f.quesElements[index] = $('<li>', {class:"item"});
		$thisQuestion.element = {};

		$thisQuestion.num = index + 1;
		$num = $('<div>', {class:"num"})
				.html($thisQuestion.num);

		$thisQuestion.element.ans = $ansDiv = $('<div>', {class:"answer"});
		$thisQuestion.element.question 
			= $question 
			= $('<div>', {class:"question", required:ques.required})
				.html(ques.question);

		$thisQuestion.element.nextButton 
			= $nextBut 
			= $('<span>', {class:"next", 'data-num':$thisQuestion.num, 'data-name':ques.id})
				.html($f.nextButtonText)
				.click(jfaNextButtonClickEvent);

		
		$thisQuestion.appendElements($num, $question);


		

		createAndAppendStructure(ques);

		
		
		
		$ansDiv.append($nextBut)


		$thisQuestion.append($ansDiv);
		$items.push($thisQuestion);
	}//jfaCreateQuestionStructure()
	function createAndAppendStructure(ques){
		switch(ques.inputType){
			case "text" : textInputStructure(ques);
			break;
			case "select": selectInputStructure(ques);
			break;
			case "date": dateInputStructure(ques);
			break;
		}

	}
	function textInputStructure(ques){
		$input = $('<input>', {type:"text", id:ques.id}).keyup(jfaOnKeyUpEvent);
		$ansDiv.append($input);

	}

	function selectInputStructure(ques){
		$ansDiv.addClass("select");

			$selectDiv = $('<select>', {name:ques.id, id: ques.id}).change(jfaOnChangeEvent);
			
			ques.values.forEach(function(ans, index, arr){
				
				$classes = "btn-answer";

				$btnAnswer = $('<button>', {name:ques.id, class: $classes, value:ans})
									.click(jfaSelectButtonClickEvent);
				$option = $('<option>', {value:ans});



				$btnAnswer.html(ans);
				$option.html(ans);

				$selectDiv.append($option);
				$ansDiv.append($btnAnswer);
				$ansDiv.append($selectDiv);
			});

	}
	function dateInputStructure(ques){
		$input = $('<input>', {type:"date", id:ques.id}).keyup();
		$ansDiv.append($input);
	}

	function updateProgressBar(){
		$numDone = $(".next.ready").length;
		$percentDone = 100*$numDone / $f.length;
		console.log($percentDone);
		$f.progressBarDiv.css('width',$percentDone + "%");
		$f.numberDoneElement.html($numDone);
	}

	function jfaGetFooterHtml(){
		$footDiv = $('<div>', {class:"footer"});
		//progress
		$progressDiv = $('<div>', {id:"progress"});
			$labelDiv = $('<div>', {class:"label"});
			$f.numberDoneElement = $leftNumSpan = $('<span>', {id:"left", text:"0"});
			$totalNumSpan = $('<span>', {id:"total", text:$f.length});
		//progressbar
			$barDiv = $('<div>', {class:"bar"});
			$f.progressBarDiv = $progressBarDiv = $('<div>', {class:"progress"});

		//nav buttons
		$navButtonsDiv = $('<div>', {id:"nav-buttons", class:"pull-right"});
			$navUpDiv = $('<div>', {class:"nav-up nav"})
							.click("up", jfaNavButtonClickEvent);
			$navDownDiv = $('<div>', {class:"nav-down nav"})
							.click("down", jfaNavButtonClickEvent);

			$iconUp = "jfa jfa-chevron-up";
			$iconDown = "jfa jfa-chevron-down";
			$iconUpElement = $('<i>', {class:$iconUp});
			$iconDownElement = $('<i>', {class:$iconDown});



		$navUpDiv.append($iconUpElement);
		$navDownDiv.append($iconDownElement);

		$navButtonsDiv.appendElements($navDownDiv, $navUpDiv);

		$betweenText = " of ";
		$finishedText = " done.";

		$barDiv.appendElements($progressBarDiv);
		$progressDiv.appendElements($leftNumSpan, $betweenText , $totalNumSpan, $finishedText, $barDiv);

		$footDiv.appendElements($progressDiv, $navButtonsDiv);

		return $footDiv;

	}

	//clickEvents
	function jfaNextButtonClickEvent(){
		if($f.currentQuestion < $f.length - 1)
			$f.currentQuestion++;
		$f.goToQuestion(parseInt($(this).attr('data-num')));
		updateProgressBar();
	}

	function jfaSelectButtonClickEvent(){
		var name = $(this).attr("name");
		$("button[name=" + name + "]").removeClass("selected");
		$(this).addClass("selected");
		$("select#" + name).val($(this).val());
		$curVal = $("select[name=" + name + "]").val();
		$("select#" + $(this).attr("name")).val();

		$(".next[data-name="+ name + "]").addClass("ready");

		updateProgressBar();
	}

	function jfaNavButtonClickEvent(event){
		var direction = event.data;
		console.log(direction);
		if(direction == "up" && $f.currentQuestion != 0)
			$f.goToQuestion(--$f.currentQuestion);
		else if(direction == "down" && $f.currentQuestion != $f.length - 1)
			$f.goToQuestion(++$f.currentQuestion);
		
		updateProgressBar();
	}

	//keyUpEvents
	function jfaOnKeyUpEvent(){
		var val = this.value;
		var id = this.attributes.id.value;

		console.log($nextBut);
		if(val.length > 2){
			$nextBut = $(".next[data-name=" + id + "]").addClass("ready");
			
		} else {
			$nextBut = $(".next[data-name=" + id + "]").removeClass("ready");

		}
		updateProgressBar();
	}

	//onChangeEvents
	function jfaOnChangeEvent(){
		console.log("fwe")
	}




	(function addCustomJqueryElementFunctions(){

		$.fn.appendElements = appendElements;

	})();

	function removeCustomJqueryElementFunctions(){
		$.fn.appendElements = null;

	}

	//Utlities
	function appendElements(){

		for (var z = 0; z < arguments.length; z++) {
			this.append(arguments[z]);
		};
	}


	//Debug Utlities
	function jfaPrint(type, values){
		type = type || "all";
		values = values = false;

		$f = this;

		switch(type){
			case "questions":
			
			var allQuestions = "";

			$f.questions.forEach(function(item, index, arr){
				var completeQuestion = "";
				completeQuestion += (index + " : " + item.question);
				if(values && item.values != undefined){
					var t = "\tValues:\n\t\t";
					item.values.forEach(function(item, index, arr){
						t += (index + " : " + item + "\t");
					});
					
					completeQuestion += t;
				}
				allQuestions += "\n" + completeQuestion;
			});
			return allQuestions + "\n";
			break;

			case "all":
			return this;
			break;

			default:
			if($f[type] != undefined)
				return $f[type];
			
		}
		jfaWarn("The '" + type + "' property was not found");
	}

	function jfaWarn(string){
		
		console.warn("JfaForm: " + string);
		return;
	}









	$testForm = {
		"id":"test",
		"welcome":"Hey, ready to flow? First let us know you're here!",
		"nextButtonText" : "next",
		"submitButtonText" : "Send It!",
		"questions":[
		{
			"id":"name",
			"question":"What's your name?",
			"boolean":false,
			"required":true,
			"inputType":"text",
		},
		{
			"id":"is-Student",
			"question":"Are you a student?",
			"values":["yes", "no"],
			"boolean":true,
			"required":false,
			"inputType":"select",
		},

		{
			"id":"student-id",
			"question":"Student Id Number?",
			"boolean":false,
			"required":false,
			"inputType":"text",
		},

		{
			"id":"tshirt-size",
			"question":"What's your t-shirt size?",
			"values" : ["x-small", "small", "medium", "large", "x-large", "xx-large"],
			"boolean":false,
			"required":true,
			"inputType":"select",
		},
		{
			"id":"transport-type",
			"question":"What's your your type size?",
			"values" : ["run", "fly", "swim"],
			"required":true,
			"inputType":"select",
		},
		{
			"id":"birthdate",
			"question":"When's your birthday?",
			"required":false,
			"inputType":"date",
		}
	], //questions

	"thanks":"Thank you for cheking in with us! Go Flow!"

}//testForm object