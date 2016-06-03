# JFA_Form
Simple and dynamic form. Javascript for creating an HTML5 form from a passed in object.

## What JFA is?
Juggling and Flow Arts, my motivation or reason to making this. 
So it's just a prefix to prevent conflict with other libraries.

## Why create JFA_Form?
I wanted to create my own [TypeForm](https://www.typeform.com/), a great application, implementation where I know
what's going on and have complete control over it.


###How it works
It creates elements from a javascript object that looks as follows.
```
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
			"max":"01-01-2010",
			"min":"01-02-1922"
		}
	], //questions

	"thanks":"Thank you for cheking in with us! Go Flow!"

}//testForm object
```

### Options
``id`` a unique id for where the form is going to be set

``welcome`` welcome message to be display at the beginning

``nextButtonText`` text to be displayed in the next button

``submitButtonText`` text to be displayed in the submit button

``questions`` an array of objects for the questions



#### Question Options
``id`` a unique id to used for the question

``question`` the questions' text to be displayed

``required`` a boolean value of ``true`` or ``false`` to specify if the question is required

``inputType`` string value with an input type for the answer being any of the HTML5 inputs

``values``* an array of the values used for select question

``boolean`` a boolean value of ``true`` or ``false`` to specify if the question is a true or false question

``min`` & ``max`` and used for the min and max of inputs number and date


\*``values`` is required on ``inputType``s of ``select`` and ``boolean`` 


This is passed to the jfaFrom "constructor" for each part of the jfa_form.
Then calling init() on that object puts the questions with numbers in the 
element with the id ``"test"`` in this case.

As you image this could also be a json file 
that is then parse into a JavaScript object.  


#### Making a new JFA_Form and putting on the dom.
```	
	var r = new jfaForm($testForm);	
	r.init();
```

##### Next Steps
- [ ] Create structure for url input
- [ ] Create structure for time input
- [ ] Create structure for week input
- [ ] Create structure for search input
- [ ] Create structure for datetime input

- [ ] Style Date input

