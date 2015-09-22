var debug = false;;

// 
// Here is how to define your module 
// has dependent on mobile-angular-ui
// 
var app = angular.module('MobileAngularUiExamples', [
  'Cordova',                                                   
  'ngRoute',
  'ngSanitize',
  'mobile-angular-ui',
  
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and 
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like 
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures',
  'starter.services'
  
]);


// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'templates/home.html', reloadOnSearch: false});

});

app.controller('MainController', function(cordovaReady,$rootScope, $scope,$location,$route,$sanitize){
	
	console.log('main');
	if (debug)
		alert('maindd');
	
	$scope.quiz = {};
	$scope.quiz.actif = 'autre';
	$scope.quiz.uuid = generateUUID();

	 async.series([	
	               		function(callback){ cordovaReady(callback);},
	               		function(callback){init_DB(callback);},
	               		
	               		//creta table
		               	function(callback){createTableQuestionnaires(callback);},
		               	//function(callback){createTableHoraires(callback);},
		               	function(callback){createTableReponses(callback);},
		               	
		               	//create db content
		               	function(callback){createQuestionnairesSuccess(callback);},

	               		],
	   				 
	               		function(err, results ){		 		
		 					displayQuestionID($scope,1);
	   			 			console.log(results);
	   		         }
	   		 );//fin  async.series
	 
	 $scope.goToStartQuiz = function(clickEvent){
		 //save ID;
		 quiz = $scope.quiz;
		 async.series([	
			              function(callback){ saveReponses(quiz,callback);},
		               	],
		   				 
	               		function(err, results ){		 	
			 				$( "input" ).prop( "checked", false );
			 				$scope.quiz.actif = false;
			 				$scope.$apply(function(){return true;});
	   			 			console.log(results);
	   		         }
	   		 );//fin  async.series
		 
		};
	 
	 $scope.startQuiz = function(clickEvent){
 			displayQuestionTemplate($scope,2);
 			};
 			
 	$scope.nextQuiz = function(clickEvent){
 				//save
 				quiz = $scope.quiz;
 				async.series([	
 				              function(callback){ saveReponses(quiz,callback);},
 			               	],
 			   				 
		               		function(err, results ){		 	
 								$( "input" ).prop( "checked", false );
 								displayQuestionTemplate($scope,$scope.quiz.next);
		   			 			console.log(results);
		   		         }
		   		 );//fin  async.series
 				/*console.log($("input[name="+res.rows.item(current).qid+"]:checked").attr("value"));
 				rep = $("input[name="+res.rows.item(current).qid+"]:checked").attr("value");*/
 			//	var timestamp = Math.round(new Date().getTime() / 1000);
 			/*	db.transaction(function(tx) 
 						{
 								//tx.executeSql('INSERT INTO "reponses" (sid, reponse) VALUES ("useOK","'+resultForm+'");
 								tx.executeSql('INSERT INTO "reponses" (sid, gid,qid, reponse,tsreponse) VALUES ("'+res.rows.item(current).sid+'","'+res.rows.item(current).gid+'","'+res.rows.item(current).qid+'","'+rep+'","'+timestamp+'");', [], function(tx, res) {});//insert
 						});//Transaction*/

 				
 					

 			}
 	
 	$scope.sendQuiz = function(clickEvent){
 		sendReponses();
 	}
 	

	 
		 
/*  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;
  
  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });*/
});


//DYN TEMPLATE
/**GESTION TEMPLATE DYN **/
app.directive("groupe", function() {
	return {
	    template: '<ng-include src="getTemplateUrl()"/>',
	    //scope: {},
    	//transclude: true,
	    scope: {
	      groupe: '=data'
	    },
	    restrict: 'E',
	  //  scope: true,
	    controller: function($scope, $element, $attrs) {
	      //function used on the ng-include to resolve the template
	      $scope.getTemplateUrl = function() {
	    	  console.log('template dyn');
	        //switch template
	        if ($scope.groupe.qtype == "N")
	        {
	        	if ($scope.groupe.config.tpl == "radio")
	          //return myLocalized.partials + "tpl_radio.tpl.html";
	        		return "templates/tpl_radio.tpl.html";
	        	if ($scope.groupe.config.tpl == "slider")
		          //return myLocalized.partials + "tpl_radio.tpl.html";
		        	return "templates/tpl_slide.tpl.html";
	        	if ($scope.groupe.config.tpl == "texte")
			          //return myLocalized.partials + "tpl_radio.tpl.html";
			        	return "templates/tpl_text.tpl.html";
	        }
	      }
	    }
	  };
	});

//CORDOVA
angular.module('Cordova', [])
.factory('cordovaReady', function(){
  return function(done) {
    if (typeof window.cordova === 'object') {
      document.addEventListener('deviceready', function () {
    	  console.log('cordovaready');
    	  if (debug)
				alert( 'cordovaready');
    	  done(null,'cordoveaok');
      }, false);
    } else {
      done();
      done(null,'cordoveako');
    }
  };
});