
function jfaForm($f){
	//add side bar 
	//add next on enter
	if($f.id != undefined){

		if($f.questions.length < 1){
			jfaWarn("There are no questions.")
			return;
		}
		this.id = $f.id;
		this.title = $f.title;
		this.logoPath = $f.logoPath;
		this.container = $('#' +$f.id);
		this.welcome = $f.welcome;
		this.questions = $f.questions;
		this.thanks = $f.thanks;
		this.nextButtonText = $f.nextButtonText;
		this.submitButtonText = $f.submitButtonText;
		this.postPath = $f.postPath;
		this.post = jfaPostData;
		this.length = $f.questions.length;
		this.print = jfaPrint;
		this.init = jfaSetHtml;
		this.quesElements = [];
		this.required = [];
		this.percentDone = 0;
		this.currentQuestion = 0;
		this.goToQuestion = jfaGoToQuestion;
		this.ansElements = [];
		this.valid = false;
		this.init();


	} else {
		jfaWarn("No id was entered for JfaForm.");
	}


	
}	



//visual
function jfaGoToQuestion(num){
	num = num != undefined ? num : this.currentQuestion;
	 	
	if(num != this.length ){
		jfaMakeActiveQuestion.call(this, num);
		$curScroll = $('#'+ this.id).scrollTop();
		$('#'+ this.id).animate({
			scrollTop : $curScroll + this.quesElements[num].offset().top - 100
		}, 1000);
	}
	

}

function jfaMakeActiveQuestion(num){

	$('.item').removeClass('active');
	$ques = this.quesElements[num];
	$ques.addClass('active');
}

function jfaSetHtml(){
	$f = this;
	$container = $('#' + $f.id);
	$submitBtnAttrs = {	
						id:$f.id+"-submit", class:"submit", 
						type:"submit", text:$f.submitButtonText
					};
	$submitBtn = $("<button>", $submitBtnAttrs)
				.click(function(){
					jfaSubmit.call($f);
				});
	$header = jfaGetHeaderHtml();
	$footer = jfaGetFooterHtml();
	$thanks = jfaGetThanksHtml();
	$sideBar = jfaGetSideBarHtml();
	$container.addClass("jfa-form open");
	$items = [];


		$f.questions.forEach(jfaCreateQuestionStructure);


		$ulQuestions = $('<ul>', {class:"questions"});
		$items.forEach(function(item){
			$ulQuestions.append(item);
		});

		$ulQuestions.append($submitBtn);


		$container.append();
		

		$container.appendElements($header, $ulQuestions, $footer, $sideBar, $thanks);

		jfaScrollEvent();
	}//jfaSetHtml
	function jfainit(){
		jfaSetHtml();
		jfaScrollEvent();
	}//jfainit

	function jfaSubmit(){
		$f = this;
		this.required.forEach(function(item){
			if(item.element.ans.val() != "")
			console.log(item);
		})

		this.quesElements.forEach(function(item, index){
			jfaValidateInput.call($f, item, index);
		});
		if(this.valid){
		console.log("Here");
			this.post();
		}

	}//jfaSubmit

	function jfaValidateInput(item, index){
		$question = item.element.question.html();
		$ans = item.element.ans.val();
			
		// validation happens

		


		var valid = true;
		if(valid){
			this.valid = true;
		}



	}//jfaValildateInput

	function jfaPostData(){

		data = {};
		$f = this; 
		this.ansElements.forEach(function(item){
			data[item[0].id] = item.val();
		});
		console.log(data);

		$url = this.postPath;

		$.post($url, data, function (data){
			$("#" + $f.id + " .thanks").addClass('open');
		}).fail(function(d){
			if(d.status == 404)
				jfaWarn('The postpath: ' + $url + ' could not be found');
			else {
				jfaWarn('Something went wrong when posting!');
			}
		});
	}//jfaPostData

	function jfaScrollEvent(){
		
		$f.container.scroll(function(){
			$f.questions.forEach(jfaCheckItemInViewport);
		});
	}//jfaScrollEvent
	
	function jfaCreateQuestionStructure(ques, index, arr){
		$classes = index == 0 ? "item active" : "item";
		$thisQuestion = $f.quesElements[index] = $('<li>', {class:$classes, "data-ques":ques.id});
		$thisQuestion.element = {};

		$thisQuestion.num = index + 1;
		$num = $('<div>', {class:"num"})
				.html($thisQuestion.num);

		$thisQuestion.element.ansContainer = $ansDiv = $('<div>', {class:"answer"});
		$thisQuestion.element.question 
			= $question 
			= $('<div>', {class:"question", required:ques.required})
				.html(ques.question);
		if(ques.required){
			$f.required.push($thisQuestion);
			$thisQuestion.answered = false;
		}

		$thisQuestion.element.nextButton 
			= $nextBut 
			= $('<span>', {class:"next", 'data-num':$thisQuestion.num, 'data-name':ques.id, 'tabindex':0})
				.keypress(jfaNextButtonKeyPress)
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
			case "email": emailInputStructure(ques);
			break;
			case "text" : textInputStructure(ques);
			break;
			case "select": selectInputStructure(ques);
			break;
			case "date": dateInputStructure(ques);
			break;
			case "number": numberInputStructure(ques);
			break;
		}

	}
	function emailInputStructure(ques){
		$thisQuestion.element.ans = 
		$input = $('<input>', {type:"email", id:ques.id}).keyup(jfaOnKeyUpEvent);
		$ansDiv.append($input);
		$f.ansElements.push($input);
	}

	function textInputStructure(ques){
		$thisQuestion.element.ans = 
		$input = $('<input>', {type:"text", id:ques.id}).keyup(jfaOnKeyUpEvent);
		$ansDiv.append($input);
		$f.ansElements.push($input);
	}

	function selectInputStructure(ques){
		$ansDiv.addClass("select");

		$thisQuestion.element.ans = 
		$selectDiv = $('<select>', {name:ques.id, id: ques.id, tabindex:-1}).change(jfaSelectOnChangeEvent);
		$f.ansElements.push($selectDiv);	
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
		$minDate = ques.min || "01-01-1930";
		$maxDate = ques.max || "01-01-2010";

		$thisQuestion.element.ans = 
		$input = $('<input>', {type:"date", id:ques.id, placeholder:"04/07/1993", min:$minDate, max:$maxDate}).keyup(jfaCalendarKeyUpEvent).change(jfaCalendarKeyUpEvent);
		$f.ansElements.push($input);
		$ansDiv.append($input);
	}
	function numberInputStructure(ques){
		$minNum = ques.min || "";
		$maxNum = ques.max || "";

		$thisQuestion.element.ans = 
		$numberDiv = $('<input>', {id:ques.id, type:'number'}).keyup(jfaNumberKeyUpEvent);
		$f.ansElements.push($numberDiv);

		$ansDiv.append($numberDiv);
	}

	function updateProgressBar(){
		$numDone = $(".next.ready").length;
		$f.percentDone = 100*$numDone / $f.length;
		$f.progressBarDiv.css('width',$f.percentDone + "%");
		$f.numberDoneElement.html($numDone);
	}//updateProgressBar

	function jfaGetHeaderHtml(){
		$headDiv = $('<div>', {class:"header"});
		$brand = $('<div>', {class:"brand"});
		$logo = $('<img>', {class:"logo", src:$f.logoPath, alt:"Logo"});
		$title = $('<div>', {class:"title", text:$f.title});

		$brand.append($logo);
		$headDiv.appendElements($brand, $title);
		return $headDiv;

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

	}//jfaGetFooterHtml

	function jfaGetThanksHtml(){
		$thanksDiv = $('<div>', {class:'thanks'});
		$message = $('<h2>', {text:$f.thanks});
		$thanksDiv.append($message);

		return $thanksDiv;
	}

	function jfaGetSideBarHtml(){
		$sideBarDiv = $('<div>', {class:'side-bar'});
		$f.questions.forEach(function(ques) {
			$quesBar = $('<div>', {class:'ques-bar', 'data-ques':ques.id});
			$circDiv = $('<div>', {class:'circ'});
			$ques = $('<div>', {class:'ques', text:ques.question});
			
			$quesBar.append($circDiv);
			$quesBar.append($ques);
			$sideBarDiv.append($quesBar);
		});

		return $sideBarDiv;
	}//jfaGetSideBarHtml()

	//clickEvents
	function jfaNextButtonClickEvent(){
		if($f.currentQuestion < $f.length - 1)
			$f.currentQuestion++;
		$f.goToQuestion(parseInt($(this).attr('data-num')));
		updateProgressBar();
	}

	function jfaSelectButtonClickEvent(){
		var name = $(this).attr("name");
		$('button[name=' + name + ']').removeClass("selected");
		$(this).addClass("selected");
		$('select#' + name).val($(this).val());
		$curVal = $('select[name = ' + name + ']').val();
		$('select#' + $(this).attr("name")).val();

		$('.next[data-name='+name +']').addClass("ready");
		$('.ques-bar[data-ques= '+ name + ']').addClass("done");

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
	function jfaOnKeyUpEvent(e){
		console.log(e.keyCode);
		var val = this.value;
		var id = this.attributes.id.value;

		if(val.length > 2){
			$nextBut = $('.next[data-name='+ id + ']').addClass("ready");
			$('.ques-bar[data-ques=' + id + ']').addClass("done");
		} else {
			$nextBut = $('.next[data-name=' + id + ']').removeClass("ready");
			$('.ques[data-ques= ' + id + ']').removeClass("done");

		}
		updateProgressBar();
	}

	function jfaNumberKeyUpEvent(e){
		jfaOnKeyUpEvent.call(this, e);

	}//jfaNumberKeyUpEvent
	function jfaCalendarKeyUpEvent(e){
		jfaOnKeyUpEvent.call(this, e);

	}//jfaCalendarKeyUpEvent
	
	//onChangeEvents
	function jfaSelectOnChangeEvent(){
				

	}//jfaSelectOnChangeEvent



	//onkeypress
	function jfaNextButtonKeyPress(){

	}//jfaNextButtonKeyPress
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

	function jfaCheckItemInViewport(ques, index, items){
		$questionContainer = $('#' + ques.id);
		$curQues = $f.currentQuestion;
		if($curQues != index && $questionContainer.inViewport()){	
			$i = items[index];
			if(index > $curQues)
				$f.currentQuestion ++;
			else $f.currentQuestion--;
			jfaMakeActiveQuestion.call($f, index)
		}

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
				completeQuestion += (index + ':' + item.question);
				if(values && item.values != undefined){
					var t = "\tValues:\n\t\t";
					item.values.forEach(function(item, index, arr){
						t += (index + ':' + item.question + '\t');
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
		
		console.warn('JfaForm: '+ string);
		return;
	}

//outsourced

$.fn.inViewport = function checkInViewport() {
	
	$item = $(this).parent().parent();
	offset = $item.offset().top;
	$height = $item.height();

	$val = window.innerHeight - (offset + $height);

	console.log();
  
  return (
   $val > 0 && $val < window.innerHeight
  );
}






$testForm = {
		"id":"test",
		"welcome":"Hey, ready to flow? First let us know you're here!",
		"nextButtonText" : "next",
		"submitButtonText" : "Send It!",
		"postPath" : "postit.php",
		"logoPath" : "logo.png",
		"title":"JFA Sign-up",
		"questions":[
		{
			"id":"name",
			"question":"What do you go by?",
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
			"inputType":"number",
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
			"max":"01-01-2010",
			"min":"01-02-1922"
		}
	], //questions

	"thanks":"Thank you for cheking in with us! Go Flow!"

}//testForm object



