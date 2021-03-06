
$(document).ready(function () {

    $(document).foundation();

    // Global variables for Settings page elements
    // var selectedGoal = "";
    var muscleGroup = "";
    var days = "";
    var weeks = "";

    // variable used by workout api call in determining how many times loops are run
    var numDays = 0;

    // storage of the basic 3 arrays that get cleared after running
    var upperArray = [];
    var lowerArray = [];
    var fullBodyArray = [];

    // arrays to hold the search results split into there muscle catagories
    var absArray = [];
    var armsArray = [];
    var legsArray = [];
    var chestArray = [];
    var backArray = [];
    var calvesArray = [];
    var shouldersArray = [];
    
    //used for holding the random choices to make up a leg day 
    var lowerWorkout = []

    // object to store all workouts 
    var workOut = {
            upperBody: {
                days: [{
                    day: 1,
                    exercises: []
                },{
                    day: 2,
                    exercises: []
                },{
                    day: 3,
                    exercises: []
                },{
                    day: 4,
                    exercises: []
                },{
                    day: 5,
                    exercises: []
                }]
            },
            lowerBody: {
                days: [{
                    day: 1,
                    exercises: []
                },{
                    day: 2,
                    exercises: []
                },{
                    day: 3,
                    exercises: []
                },{
                    day: 4,
                    exercises: []
                },{
                    day: 5,
                    exercises: []
                }]
            },
            fullBody: {
                days: [{
                    day: 1,
                    exercises: []
                },{
                    day: 2,
                    exercises: []
                },{
                    day: 3,
                    exercises: []
                },{
                    day: 4,
                    exercises: []
                },{
                    day: 5,
                    exercises: []
                }]
            },
        }
    
        // url used in the api call
    var queryUrl = "https://wger.de/api/v2/exercise/?language=2&status=2&limit=200"

    // function to run when page loads
    getUserName();

    // retrieve username from local storage
    function getUserName() {
        var displayUN = localStorage.getItem("Username");
        // display username to html
        $("#userName").text(displayUN);
    }

    // Event listener for Days Slider
    $("#sliderDays").on("change changed.zf.slider", function() {

        // get value of selected days
        days = $(this).data().zfPlugin.$input[0].value;

        // display slider value to h5 next to it
        $("#sliderDaysText").text(days);

        // save days to localStorage
        localStorage.setItem("days", JSON.stringify(days));
        
        numDays = parseInt(days);

    });

    // Event listener for Weeks Slider
    $("#sliderWeeks").on("change changed.zf.slider", function() {

        // get value of selected weeks
        weeks = $(this).data().zfPlugin.$input[0].value;

        // display slider value to h5 next to it
        $("#sliderWeeksText").text(weeks);
        
        // save weeks to localStorage
        localStorage.setItem("weeks", JSON.stringify(weeks));
    });


    // Event listener for each of the Muscle Group Buttons
    $("#fullBodyBtn").on("click", function() {
        // assign muscleGroup value to "full"
        muscleGroup = "full";

        // call function to save data to localStorage and add pressed effect
        saveMuscleGroup();
    });

    $("#upperBtn").on("click", function() {
        // assign muscleGroup value to "upper"
        muscleGroup = "upper";

        // call function to save data to localStorage and add pressed effect
        saveMuscleGroup();
    });

    $("#lowerBtn").on("click", function() {
        // assign muscleGroup value to "lower"
        muscleGroup = "lower";

        // call function to save data to localStorage and add pressed effect
        saveMuscleGroup();
    });

    // this function is being in each Muscle Group buttons
    function saveMuscleGroup() {

        // addClass clicked styling to selected MGButton
        if (muscleGroup === "full") {
            $("#upperBtn").removeClass("MGButtons-clicked");
            $("#lowerBtn").removeClass("MGButtons-clicked");
            $("#fullBodyBtn").addClass("MGButtons-clicked");
        } else if (muscleGroup === "upper") {
            $("#fullBodyBtn").removeClass("MGButtons-clicked");
            $("#lowerBtn").removeClass("MGButtons-clicked");
            $("#upperBtn").addClass("MGButtons-clicked");
        } else if (muscleGroup === "lower") {
            $("#fullBodyBtn").removeClass("MGButtons-clicked");
            $("#upperBtn").removeClass("MGButtons-clicked");
            $("#lowerBtn").addClass("MGButtons-clicked");
        }

        // save muscleGroup data to localStorage 
        localStorage.setItem("muscleGroup", JSON.stringify(muscleGroup));
    }
    

    // Get My Plan event listener
    $(".GMPBtn").on("click", function() {

        // if user did not select an option from each category
        if (days === "0" || weeks === "0" || muscleGroup === "") {
            
            // add modal attribute
            $(".GMPBtn").attr("data-open", "settings-modal");

            // run animation when modal appears
            $("#settings-modal").on("closeme.zf.reveal", function(e) {
                Foundation.Motion.animateIn(e.target, "slide-in-right");
            });

            // Days: condition for check or x icon to appear
            if (days === "0") {
                $("#liGoal").removeAttr("class", "fi-check");
                $("#liDays").attr("class", "fi-x");
            } else {
                $("#liGoal").removeAttr("class", "fi-check");
                $("#liDays").attr("class", "fi-check");
            }

            // Weeks: condition for check or x icon to appear
            if (weeks === "0") {
                $("#liGoal").removeAttr("class", "fi-check");
                $("#liWeeks").attr("class", "fi-x");
            } else {
                $("#liWeeks").attr("class", "fi-check");
            }

            // Muscle Group: condition for check or x icon to appear
            if (muscleGroup === "") {
                $("#liMuscle").attr("class", "fi-x");
            } else {
                $("#liMuscle").attr("class", "fi-check");
            }
        
        // if one option has been selected from each category
        } else {
            // remove modal attribute
            $(".GMPBtn").removeAttr("data-open");

            // display progress bar
            // $(".progress").css("display", "inline");
            
            $(this).fadeOut(500); // Fades out submit button when it's clicked
            setTimeout(function() { // Delays the next effect

                $("#prog-bar").fadeIn(500); // fades in the progress bar
                $("#prog-bar").animate({width : "100%"}, 3000); // animates the progress bar
                $("#prog-text").animate({"margin-left": "40%" }, 3000); // animates the left margin of text
                setTimeout(function() { // delays the next effect
                    $(".progress").fadeOut(500); // fades out progress bar when animation completes
                }, 2500);

            }, 500);

            // remove previous workout from local storage
            localStorage.removeItem("workout")

            // remove previous workout from local storage
            localStorage.removeItem("checkboxString")
            
            // calls function which contains the apiCall
            apiCall();
        }
        
    });


    var goToPlanner  = function() {
        window.location.href="PersonalPlanner.html"
    }
    // start of workout APi code --------------------------------------------------------------------------------------------------------------------------------------

    var apiCall = function() {

        $.ajax({
        url: queryUrl,
        method: "GET"
        }).then(function (response) {
            // creating object to store results
            var exerciseObject = response.results

            //  running a for loop to put every exercise into a category 
            for (var i = 0; i < exerciseObject.length; i++ ){
                if(exerciseObject[i].category === 10) {

                    absArray.push(exerciseObject[i]);

                } else if(exerciseObject[i].category === 8) {

                    armsArray.push(exerciseObject[i]);

                } else if(exerciseObject[i].category === 12) {
                   
                    backArray.push(exerciseObject[i]);

                } else if(exerciseObject[i].category === 14) {
                    
                    calvesArray.push(exerciseObject[i]);

                } else if(exerciseObject[i].category === 11) {
                    
                    chestArray.push(exerciseObject[i]);

                } else if(exerciseObject[i].category === 9) {
                    
                    legsArray.push(exerciseObject[i]);

                } else if(exerciseObject[i].category === 13) {
                    
                    shouldersArray.push(exerciseObject[i]);
                } else {}
            }
            
            // length of array variables for each of the functions to use with math.random
            var aLength = armsArray.length;
            var bLength = backArray.length;
            var cLength = chestArray.length;
            var sLength = shouldersArray.length;
            var calLength = calvesArray.length;
            var lLength = legsArray.length;
            var absLength = absArray.length;

            var getUpper = function() {
                // get length of each upperBody array
                var tempArray = []

                // outer loop is used to cycle through the inner loop based on the number of days 
                for (b = 0; b < numDays; b++) {
                
                    for (var i = 0; i < 2; i++) {
                        // //take 2 random arms exercises
                        var rngA = Math.floor(Math.random()* aLength)
                        var rngC = Math.floor(Math.random()* cLength)
                        var rngB = Math.floor(Math.random()* bLength)
                        var rngS = Math.floor(Math.random()* sLength)

                        // uses rngNum to find index of 
                        upperArray.push(armsArray[rngA])
                        upperArray.push(chestArray[rngC])
                        upperArray.push(backArray[rngB])
                        upperArray.push(shouldersArray[rngS])
                    }

                    //want to add upperArray
                    workOut.upperBody.days[b].exercises = tempArray.concat(upperArray)
                    
                    //clear upperArray
                    upperArray = [];
                } 

                // code to set workout in local storage
                localStorage.setItem("workout", JSON.stringify(workOut))
            }
            
        
            var getLower = function() {
                // temp array so i can concat
                var tempArray = []

                //two for loops to create an overall lowerBody Array 
                for (var i =0; i < legsArray.length; i++) {
                    lowerArray.push(legsArray[i]);
                }

                for (var i = 0; i < calvesArray.length; i++) {
                    lowerArray.push(calvesArray[i])
                }
                
                var legsLength = legsArray.length;

                for (var b = 0; b < numDays; b++) {
                    // this is the outer loop for number of days 

                    for(var i = 0; i < 8; i++) {
                        // this inner loop is for getting random exercises 
                        var rngLegs = Math.floor(Math.random() * legsLength);
                        lowerWorkout.push(legsArray[rngLegs]);
                    }

                    //adds the randomly generated leg workout and adds it to the exercises array based on the day
                    workOut.lowerBody.days[b].exercises = tempArray.concat(lowerWorkout)

                    //clear lowerWork
                    lowerWorkout = []
                }

                // creating a heading for the lowerBody object
                $("#lower").append($("<h1>", {
                    text: "Lowerbody Workouts"
                }))

                // code to set workout in local storage
                localStorage.setItem("workout", JSON.stringify(workOut))
            }
            

            var getFullBody = function() {
                // used to get a random index position
                
                
                // temp array so i can concat
                var tempArray = []

                for (var b = 0; b < numDays; b++) {
                
                    for (var i = 0; i < 1; i++) {
                        var rngA = Math.floor(Math.random()* aLength);
                        var rngC = Math.floor(Math.random()* cLength);
                        var rngB = Math.floor(Math.random()* bLength);
                        var rngS = Math.floor(Math.random()* sLength);
                        var rngCal = Math.floor(Math.random() * calLength);
                        var rngL = Math.floor(Math.random()*lLength);
                        var rngAbs = Math.floor(Math.random() * absLength);

                        //add one exercise from legs
                        fullBodyArray.push(legsArray[rngL])

                        //add one exercise from chest 
                        fullBodyArray.push(chestArray[rngC])

                        //add one back exercise
                        fullBodyArray.push(backArray[rngB])

                        //add one exercise from shoulders
                        fullBodyArray.push(shouldersArray[rngS])

                        //add one exercise from calves
                        fullBodyArray.push(calvesArray[rngCal])

                        //add one exercise from arms
                        fullBodyArray.push(armsArray[rngA])

                        //add one exercise from abs
                        fullBodyArray.push(absArray[rngAbs]);
                    }

                    //take one extra back exercise to make 8 total exercises
                    fullBodyArray.push(backArray[rngB])

                    //adds the randomly generated leg workout and adds it to the exercises array based on the day
                    workOut.fullBody.days[b].exercises = tempArray.concat(fullBodyArray)
                
                    // clear fullbody array
                    fullBodyArray = []
                }

                // code to set workout in local storage
                localStorage.setItem("workout", JSON.stringify(workOut))
            
            }

            // if statements based on what buttons the user selects based on their plan 
            if (muscleGroup === "lower") {
                getLower();
            } else if (muscleGroup === "upper") {
                getUpper();
            } else if (muscleGroup === "full") {
                getFullBody();
            } else {
                return
            }

            
        }).done(function() {
            goToPlanner();
        });

    }

});

