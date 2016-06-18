
/*
	*	Throughout the code the jfaForm object 
	* 	is referended as $f 
	*	
	**/	

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
		this.resetDelay = $f.resetDelay || 10;
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

/*
	*	Scrolls to question with the index of the number passed in
	*	Parameters: num
	**/	
function jfaGoToQuestion(num){
	num = num != undefined ? num : this.currentQuestion;
	 	
	if(num != this.length ){
		$curScroll = $('#'+ this.id).scrollTop();
		$('#'+ this.id).animate({
			scrollTop : $curScroll + this.quesElements[num].offset().top - 100
		}, 1000);
		jfaMakeActiveQuestion.call(this, num);
	}
	

}
/*
	*	Changes the current active question; 
	*	adds corresponding classes; and focuses on input
	*   all according to the passed in number
	*	Parameters: num
	**/	
function jfaMakeActiveQuestion(num){

	$('.item').removeClass('active');
	$ques = this.quesElements[num];
	$ques.addClass('active');
	$nextInput = $ques.find('input, select').first();
	if(!$nextInput.is('select'))
		$nextInput.focus();
	else {
		$nextInput.parent().children('.btn-answer').focus();
	}
	
}
/*
	*	Create the HTML structure of the jfaForm 
	*	and added it to the document according to 
	*   the id specified
	*	
	**/	
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

	/*
		*	Validates input before submitting the 
		*	the answers via post.
		*	
		**/	
	function jfaSubmit(){
		$f = this;
		//validation not yet implemented
		this.required.forEach(function(item, $f){
			if(item.element.ans.val() != "")
				;
		})

		this.quesElements.forEach(function(item, index){
			jfaValidateInput.call($f, item, index);
		});
		if(this.valid){
			this.post();
		}

	}//jfaSubmit

	//validation of a single input
	function jfaValidateInput(item, index){
		$question = item.element.question.html();
		$ans = item.element;
		// validation happens

		


		var valid = true;
		if(valid){
			this.valid = true;
		}



	}//jfaValildateInput

	/*
		*	call jQueries ajax function post and post input
		*	to a specified file. If successful shows thank you screen
		*	and if not throws an warning to the console. 
		* 	The ajax function expects json to be returned.
		**/	
	function jfaPostData(){

		data = {};
		$f = this; 
		//parsing data in data object
		this.ansElements.forEach(function(item){
			//if not a checkbox just get value
				if(item['isCheckBox'] != true)
					data[item[0].id] = item.val();
				else {
			//if checkbox get all values selected
					
					var id = item[0];
					data[id] = [];
					$("[data-ques=" + id + "] input").each(function(){
						if (this.checked) 
						data[id].push(this.value);
					});
					
				}
		});
		$url = this.postPath;
		$.post($url, data, function (r){
			if(r.status == 'success'){
				function reset(){
					jfaReset.call($f);
				}
				console.log($f.thanks);
				if(typeof $f.thanks == "string")
					$message = $f.thanks;
				else
					$message = $f.thanks[Math.floor(Math.random()*$f.thanks.length)];

				$("#" + $f.id + " .thanks .message").html($message);
				$("#" + $f.id + " .thanks").addClass('open');
				console.log($f.resetDelay);
				setTimeout(reset, $f.resetDelay*1000);
			}else{
				jfaWarn("Database problem: " + r.reason);
			}
		})
		.fail(function(d){
			console.log(d);
			if(d.status == 404)
				jfaWarn('The postpath: ' + $url + ' could not be found');
			else {
				jfaWarn('Something went wrong when posting!  ' + d.status);
			}
		});
	}//jfaPostData

	/*
		*	A scroll Event added to the form 
		* 	checks if one of the questions is 
		*	scrolled in to view. 
		*	
		**/		
	function jfaScrollEvent(){
		
		$f.container.scroll(function(){
			$f.questions.forEach(jfaCheckItemInViewport);
		});
	}//jfaScrollEvent
	
	/*
		*	Function called in jfaSetHtml() to create the structure
		*   of each question by using the type and the index.
		*	@params ques = {num:'', type:'', id:'', required:true||false, question:"Name?"}
		*		
		**/	
	function jfaCreateQuestionStructure(ques, index, arr){
		$classes = index == 0 ? "item active" : "item";
		$thisQuestion = $f.quesElements[index] = $('<li>', {class:$classes, "data-ques":ques.id});
		$thisQuestion.element = {};

		$thisQuestion.num = ques.num = index + 1;
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
			= $('<span>', {class:"next", 'data-num':ques.num, 'data-name':ques.id, 'tabindex':0})
				.keypress(jfaNextButtonKeyPress)
				.html($f.nextButtonText)
				.click(jfaNextButtonClickEvent)
				.keyup(jfaNextButtonClickEvent);
		$pressEnterPrompt = $('<div>', {class:'jfa-enter', 'data-num':ques.num})
				.html('<small>press</small> Enter');

		
		$thisQuestion.appendElements($num, $question);


		

		createAndAppendStructure(ques);

		
		if($f.length != $thisQuestion.num){
			$ansDiv.append($nextBut)
		}
			$ansDiv.append($pressEnterPrompt);


		$thisQuestion.append($ansDiv);
		$items.push($thisQuestion);
	}//jfaCreateQuestionStructure()

	/*
		*	Create the structure of the input with the type 
		*	Specified in the ques object that is passes to 
		*	the function
		**/
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
			case "checkbox" : checkboxInputStructure(ques);
			break;
		}

	}

		/*
		*	Creates and appends the element structure 
		*	for the email input. 
		**/		
	function emailInputStructure(ques){
		$emailInputAtr = {type:"email", id:ques.id, 'data-num':ques.num};

		$thisQuestion.element.ans = 
		$input = $('<input>', $emailInputAtr)
				.keyup(jfaKeyUpEvent)
				.change(jfaKeyUpEvent);
		$ansDiv.append($input);
		$f.ansElements.push($input);
	}

	/*
	*	Creates and appends the element structure 
	* 	for the text input.
	**/	
	function textInputStructure(ques){
		$textInputAtr = {type:"text", id:ques.id, 'data-num':ques.num};
		$thisQuestion.element.ans = 
		$input = $('<input>', $textInputAtr)
				.keyup(jfaKeyUpEvent)
				.change(jfaKeyUpEvent);
		$ansDiv.append($input);
		$f.ansElements.push($input);
	}

/*
	*	Creates and appends the element structure 
	* 	for the select input.
	**/	
	function selectInputStructure(ques){
		$ansDiv.addClass("select");

		$thisQuestion.element.ans = 
		$selectDiv = $('<select>', {name:ques.id, id: ques.id, 'data-num':ques.num, tabindex:-1})
				.keyup(jfaKeyUpEvent)
				.change(jfaSelectOnChangeEvent);
		$f.ansElements.push($selectDiv);	
			ques.values.forEach(function(ans, index, arr){
				
				$classes = "btn-answer";

				$btnAnswer = $('<button>', {name:ques.id, class: $classes,'data-num':ques.num, value:ans})
									.click(jfaSelectButtonClickEvent)
									.on('keyup', jfaSelectButtonKeyUpEvent);
				$option = $('<option>', {value:ans});


				$labelSpan = $('<span>', {text:ans}); 
				$btnAnswer.append($labelSpan);
				$option.html(ans);

				$selectDiv.append($option);
				$ansDiv.append($btnAnswer);
				$ansDiv.append($selectDiv);
			});

	}
	/*
		*	Creates and appends the element structure 
		*	for the checkbox input. 
		**/	
	function checkboxInputStructure(ques){
		$ansDiv.addClass("select");
		 var id = ques.id;
		 $checkBox = {
				0 : ques.id,
				'isCheckBox' : true,
				'values' : []
		 };

			ques.values.forEach(function(ans, index, arr){
				$id = (index == 0) ? ques.id : ques.id + index;
				$checkboxAtr = {
								name:ques.id, 
								id: $id, 
								'data-num':ques.num, 
								tabindex:-1, 
								type:'checkbox', 
								value:ans
							};
				$checkboxEle = $('<input>', $checkboxAtr)
						.keyup(jfaCheckboxKeyUpEvent)
						.change(jfaCheckboxChangeEvent);
				$checkBox['values'].push($checkboxEle);
				$label = $('<label>', {'for': $id});

				$classes = "btn-answer";
				$btnAnswerAtr = {name:ques.id, class: $classes,'data-num':ques.num};
				$btnAnswer = $('<button>', $btnAnswerAtr)
									.click(jfaCheckboxButtonClickEvent)
									.keyup(jfaCheckboxButtonKeyUpEvent);
				


				$btnAnswer.appendElements($label);

				$label.html(ans);

				$ansDiv.append($btnAnswer);
				$ansDiv.append($checkboxEle);
			});
		$f.ansElements.push($checkBox);
	}
	/*
		*	Creates and appends the element structure 
		*	for the date input. 
		**/	
	function dateInputStructure(ques){
		$minDate = ques.min || "01-01-1930";
		$maxDate = ques.max || "01-01-2010";

		$thisQuestion.element.ans = 
		$dateDiv = $('<input>', {type:"date", id:ques.id, 'data-num':ques.num, placeholder:"04/07/1993", min:$minDate, max:$maxDate})
						.keyup(jfaCalendarKeyUpEvent)
						.change(jfaCalendarKeyUpEvent);
		$f.ansElements.push($dateDiv);
		$ansDiv.append($dateDiv);
	}
	/*
		*	Creates and appends the element structure 
		*	for the number input. 
		**/	
	function numberInputStructure(ques){
		$minNum = ques.min || "";
		$maxNum = ques.max || "";

		$thisQuestion.element.ans = 
		$numberDiv = $('<input>', {id:ques.id, 'data-num':ques.num, type:'number'})
						.keyup(jfaNumberKeyUpEvent);
		$f.ansElements.push($numberDiv);

		$ansDiv.append($numberDiv);
	}
	/*
	*	Update the progress bar in the footer
	**/	
	function updateProgressBar(){
		$numDone = $(".next.ready").length;
		$f.percentDone = 100*$numDone / $f.length;
		$f.progressBarDiv.css('width',$f.percentDone + "%");
		$f.numberDoneElement.html($numDone);
	}//updateProgressBar

	/*
	*	Creates the header element structure and returns it
	**/	
	function jfaGetHeaderHtml(){
		$headDiv = $('<div>', {class:"header"});
		$brand = $('<div>', {class:"brand"});
		$logo = $('<img>', {class:"logo", src:$f.logoPath, alt:"Logo"});
		$title = $('<div>', {class:"title", text:$f.title});

		$brand.append($logo);
		$headDiv.appendElements($brand, $title);
		return $headDiv;

	}
	/*
	*	Creates the footer element structure and returns it
	**/	
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

	/*
	*	Creates the thanks element structure and returns it
	**/	
	function jfaGetThanksHtml(){
		$thanksDiv = $('<div>', {class:'thanks'});
		$message = $('<h2>', {class:'message'});
		$thanksDiv.append($message);

		return $thanksDiv;
	}

	/*
	*	Creates the thanks sidebar structure and returns it
	**/	
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
	function jfaNextButtonClickEvent(e){
		if((e.type == "keyup" && e.keyCode == 13) || e.type == "click"){ 
			if($f.currentQuestion < $f.length - 1)
				$f.currentQuestion++;
			$f.goToQuestion(parseInt($(this).attr('data-num')));
			updateProgressBar();
		}
	}

	function jfaSelectButtonClickEvent(){
		var name = $(this).attr("name");
		$('button[name=' + name + ']').removeClass("selected");
		$(this).addClass("selected");
		
		$('select#' + name).val($(this).val());
		$('select#' + $(this).attr("name")).val();

		$('.next[data-name='+ name +']').addClass("ready");
		$('.ques-bar[data-ques= '+ name + ']').addClass("done");
		$('.jfa-enter[data-name= '+ name + ']').addClass("ready");

		updateProgressBar();
	}
	function jfaCheckboxButtonClickEvent(){
		var name = $(this).attr('name');
		$(this).toggleClass('selected');

		$('.next[data-name='+ name +']').addClass("ready");
		$('.ques-bar[data-ques= '+ name + ']').addClass("done");
		$('.jfa-enter[data-name= '+ name + ']').addClass("ready");
	}

	function jfaNavButtonClickEvent(event){
		var direction = event.data;
		if(direction == "up" && $f.currentQuestion != 0)
			$f.goToQuestion(--$f.currentQuestion);
		else if(direction == "down" && $f.currentQuestion != $f.length - 1)
			$f.goToQuestion(++$f.currentQuestion);
		
		updateProgressBar();
	}


	//keyUpEvents
	function jfaKeyUpEvent(e){
		var val = this.value;
		var id = this.attributes.id.value;
		var num = this.attributes['data-num'].value;
		if(val.length > 2){
			$('.next[data-name='+ id + ']').addClass("ready");
			$('.jfa-enter[data-num='+ num + ']').addClass("ready");
			$('.ques-bar[data-ques=' + id + ']').addClass("done");
			if(e.keyCode == 13){
				if(num == $f.length) 
					jfaSubmit.call($f);					
				else if($f.currentQuestion < $f.length - 1)
						$f.currentQuestion++;
					$f.goToQuestion(parseInt(num));
			}
		} else {
			$('.next[data-name=' + id + ']').removeClass("ready");
			$('.jfa-enter[data-num=' + num + ']').removeClass("ready");
			$('.ques[data-ques= ' + id + ']').removeClass("done");

		}
		updateProgressBar();
	}

	function jfaNumberKeyUpEvent(e){
		jfaKeyUpEvent.call(this, e);

	}//jfaNumberKeyUpEvent
	function jfaCalendarKeyUpEvent(e){
		jfaKeyUpEvent.call(this, e);

	}//jfaCalendarKeyUpEvent

	function jfaCheckboxKeyUpEvent(e){
		console.log(e);
	}
	
	function jfaSelectButtonKeyUpEvent(e){
		if($(this).hasClass('selected') && e.keyCode == 13){
			num = this.attributes[2].value;
			if(num == $f.length) jfaSubmit.call($f);
			if($f.currentQuestion < $f.length - 1)
				$f.currentQuestion++;
			$f.goToQuestion(parseInt(num));
		}
	}
	function jfaCheckboxButtonKeyUpEvent(e){
		console.log(e.keyCode);
		switch(e.keyCode){
			case 13:console.log("13");
		}
	}

	//onChangeEvents
	function jfaSelectOnChangeEvent(){
		

	}//jfaSelectOnChangeEvent

	function jfaCheckboxChangeEvent(){
		
	}//jfaCheckboxChangeEvent

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
	/*
		*	CHecks if an element passed in is in the
		*	the viewport and makes it the active question 
		*	if it is.
		*	Called in jfaScrollEvent()
		*	
		**/	
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
	}//print

	function jfaWarn(string){
		
		console.warn('JfaForm: '+ string);
		return;
	}//jfaWarn

	/*
	*	jfaForm reset function
	*	
	**/	
	function jfaReset(){
		$elements = {
			".select .btn-answer.selected" : "selected", 
			".ready" : "ready",
			".selected" : "selected",
			".done" : "done"
		};
		$.each($elements, function(key, value){
			$(key).removeClass(value);
		});
		updateProgressBar();
		$("#" + this.id + " input").val("");
		$("#" + this.id + " .thanks").removeClass('open');
		$('#'+ this.id).animate({
			scrollTop : 0
		}, 1000);
	}


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

