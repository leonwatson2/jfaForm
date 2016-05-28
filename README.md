# JFA_Form
Simple and dynamic form. Javascript for creating an HTML5 form from a passed in object.

## What JFA is?
Juggling and Flow Arts, my motivation or reason to making this. 
So it's just a prefix to prevent conflict with other libraries.

## Why create JFA_Form?
I wanted to create my own [TypeForm](https://www.typeform.com/), a great application, implementation where I know
what's going on and have complete control over it.

##Still in production!
For right now I'm just commiting javascript.
I test locally and have a .scss file I compile locally found in
the [style/scss](scss/scss) folder.
If you would like to see that **fell free to ask**!

###How it works
It creates elements from a javascript object that looks as follows.
```
{
    //id of the element it will be in
		"id":"test",
		
		//welcome message
		"welcome":"Hey, ready to flow? First let us know you're here!",
		
		//text for the welcome button
		"nextButtonText" : "next",
		
		//text for the submit button
		"submitButtonText" : "Send It!",
		
		//questions going to be asked
		"questions":[
		{
		//id for question 
			"id":"name",
			
			"question":"What's your name?",
			
			//Is it a true or false question
			"boolean":false,
			"required":true,
			
			//The type of input it is
			"text":true,
			"email":false,
			"checkbox":false,
			"color":false,
			"date":false,
			"datetime":false,
			"datetime-local":false,
			"month":false,
			"number":false,
			"range":false,
			"radio":false,
			"search":false,
			"select":false,
			"time":false,
			"tel":false,
			"url":false,
			"week":false
		}
	], //questions
  
  //ending thank you message
	"thanks":"Thank you for checking in with us! Go Flow!"

}//testForm object
```

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

