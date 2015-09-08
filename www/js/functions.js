var async = require('../dist/js/async.js');

////////////////////
//DB

//DB common
function errorHandler(tx, error) {
    console.log("Error: " + error.message);
    if (debug)
    	alert("Error: " + error.message);
}
function successHandler(tx, result) {
    console.log("Success: " + result);
    if (debug)
    	alert("Success: " + result);
}

// DB init
function init_DB(callback)
{
	//init base
	if(isMobile)
    	db = window.sqlitePlugin.openDatabase("Database", "1.0", "Demo", -1);
    else
    	db = openDatabase("Database", "1.0", "Demo", -1);
	callback(null,'initDb');
}



function createTableQuestionnaires(callback)
{
	db.transaction(function(tx) 
			{  
				
				// id                 
				// sid : Survey ID
				// sdescription-survey_config : configuration (ex: #scheduling:D#duration:2400#startHour:10/18#maxOccurences:42#dayOff:0#test:1#)
				// gid : group ID?
				// qid : question ID
				// question
				// qtype -> template question
				// qhelp-question_config -> Configuration : template question complément, fréquence (ex: #tpl:sl7#frq:b#)
				// answers : jsontab? ex : radio buttons

				//tx.executeSql('DROP TABLE IF EXISTS "questionnaires"');
				tx.executeSql('CREATE TABLE IF NOT EXISTS "questionnaires" ' +
								' ("id" INTEGER PRIMARY KEY AUTOINCREMENT , ' +
								'  "sid" VARCHAR,' +
								'  "sdescription-survey_config" VARCHAR,' +
								'  "gid" VARCHAR,' +
								'  "qid" VARCHAR,' +
								'  "question" VARCHAR,' +
								'  "qtype" VARCHAR,' +
								'  "qhelp-question_config" VARCHAR,' +
								'  "answers" VARCHAR );');
								//'  "answers" VARCHAR );',[],callback(null,'createQuestionnairesSuccess'),callback(true,'createQuestionnairesError'));
								//'  "answers" VARCHAR );',[],createQuestionnairesSuccess,createQuestionnairesError);
			//});
			},function(tx){callback(true,'createQuestionnairesError')},function(tx){callback(null,'createQuestionnairesSuccess')});
}


function createTableHoraires(callback)
{
	db.transaction(function(tx) 
	{  		
		//tx.executeSql('DROP TABLE IF EXISTS "horaires"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "horaires" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "uidquestionnaire" VARCHAR, "tsdebut" INTEGER, "dureevalidite" INTEGER, "notification" INTEGER, "fait" INTEGER);');                                          
	},function(tx){callback(true,'createHorairesError')},function(tx){callback(null,'createHorairesSuccess')});
}

function createTableReponses(callback)
{
	db.transaction(function(tx) 
	{  		
		//tx.executeSql('DROP TABLE IF EXISTS "reponses"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "idhoraire" INTEGER DEFAULT (0), "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse" INTEGER, "envoi" BOOLEAN not null default 0);');
	},function(tx){callback(true,'createReponsesError')},function(tx){callback(null,'createReponsesSuccess')});
}


function createQuestionnairesSuccess(callback){

		    var req = new XMLHttpRequest();
		    req.open('GET', '../www/db/questionnaires.txt', true);

		    req.onreadystatechange = function (aEvt) {
		      if (req.readyState == 4) {
		         if(req.status == 200)
		        	 {console.log("200000!!!!");
		        	 if (debug)
		        	    	alert("200000!!!!");
		        	 res = req.responseText;
		        	 insertQuestionnaire(res,callback);
		        	 }
		         else
		        {
		        	 console.log("Erreur pendant le chargement de la page.\n");
		        	 if (debug)
		        	    	alert("Erreur pendant le chargement de la page.\n");
		        	 if(isMobile)
		        	{
		        		 //cas iphone
		        		 store = cordova.file.applicationDirectory;
		        		 fileName = "www/db/questionnaires.txt";
		        		 window.resolveLocalFileSystemURL(store + fileName, function(fileEntry){readQuestionnairesSuccess(fileEntry,callback) }, readQuestionnairesFail);
		        			
		        	}
		        }
		        	 
		      }
		    };
		    req.send(null);
	//}
		
	
	console.log("dbquest");
	if (debug)
    	alert("dbquest");
	//callback();
};
function createQuestionnairesError(tx, error) {
    console.log("createQuestionnairesError: " + error.message);
    if (debug)
    	alert("createQuestionnairesError: " + error.message);
}
function readQuestionnairesSuccess(fileEntry,callback) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
			console.log(' reader');
			if (debug)
				alert(' reader');
			res = this.result;
			insertQuestionnaire(res,callback);
		}
		reader.readAsText(file);
	});
}
function readQuestionnairesFail(e) {
	console.log("FileSystem Error");
	if (debug)
		alert("FileSystem Error");
	console.dir(e);
	if (debug)
		alert(JSON.stringify(e));
}
function insertQuestionnaire(res,callback){
	db.transaction(function(tx) {
		var line = res.split("\n");
		for (var linekey in line)
		{
			var line2 = line[linekey].split("';'");
			(function (value) { 
				tx.executeSql('SELECT COUNT("id") as cnt FROM "questionnaires" WHERE sid = "'+line2[0].substring(1,line2[0].length)+'";', [], function(tx, res) {
					if (res.rows.item(0).cnt < 1)
					{
						tx.executeSql('INSERT INTO "questionnaires" (sid, "sdescription-survey_config", gid,qid, question, qtype,"qhelp-question_config", answers) VALUES("'+
								value[0].substring(1,value[0].length)+'","'+
								value[1]+'","'+
								value[2]+'","'+
								value[3]+'","'+
								value[4]+'","'+
								value[5]+'","'+
								value[6]+'","'+
								encodeURI(value[7].substring(0,value[7].length-1))+'");',[], successHandler, errorHandler);
					}//fin if
				},errorHandler);//fin select
			})(line2);
		}
	},function(tx){callback(true,'err')},function(tx){callback(null,'ok')});
}


function getQuestionsByGroupe($scope,current,callback)
{
	if (debug)
		alert('getQuestionsByGroupe');
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM "questionnaires" WHERE id = '+current+';', [], function(tx, res) {
			if (debug)
				alert('getQuestionsByGroupe1');
			if (debug) alert('scope getQuestionsByGroupe1');
			if (debug) alert(JSON.stringify($scope.quiz));
			console.log('question');
			//console.log(res);
			//if (res.rows.item(0).cnt < 1)
			if (res.rows.length < 1)
			{
				console.log('fin');
				$scope.quiz.actif = 'fin';
			}
			else
				
			{
				tx.executeSql('SELECT * FROM "questionnaires" WHERE gid = "'+res.rows.item(0)['gid']+'";', [], function(tx, res2) {		
					if (debug)
						alert('getQuestionsByGroupe2');
					if (debug) alert('scope getQuestionsByGroupe2 deb');
					if (debug) alert(JSON.stringify($scope.quiz));
					var groupes = {};
					var next = 0;
					$.each(res2.rows, function(key, groupe){
						if (debug)
							alert('each deb');
						groupe.config = getQuestionConfig(groupe['qhelp-question_config']);
						if (debug)
							alert('each 1');
						groupe.reponses = JSON.parse(decodeURI(groupe.answers));
						if (debug)
							alert('each 2');
						groupes[key] = groupe;
						if (debug)
							alert('each 3');
						next = parseInt(groupe.id) + 1;
						if (debug)
							alert('each fin');
					});
					//$scope.quiz = {};
					$scope.quiz.groupes = groupes;
					$scope.quiz.next = next;
					$scope.quiz.actif = true;
					if (debug) alert('scope getQuestionsByGroupe2');
					if (debug) alert(JSON.stringify($scope.quiz));
					callback(null,'ok');
					
				}); //SELECT GROUPE
			}
		});//select
	//},function(tx){callback(true,'err')},function(tx){callback(null,'ok')});//DB transaction
	});//DB transaction
	
}

function displayQuestionTemplate($scope,current){
	console.log(current);
	if (debug)
		alert('displayQuestionTemplate');
	if (debug)
		alert(current);
	
	 async.series([ function(callback){ getQuestionsByGroupe($scope,current,callback);if (debug) alert("async");if (debug) alert(JSON.stringify($scope.quiz));}                            
	],
		 
		function(err, results ){		
		 	//$scope.quiz.actif = true;
		 if (debug)
				alert('getQuestionsByGroupeResult');
			console.log(results);
			if (debug) alert(JSON.stringify($scope.quiz));
			$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
			console.log($scope.quiz);
	}
	);//fin  async.series

}

function getSurveyConfig()
{
	var config = {};
	var strSurveyConfig = surveys_languagesettings[0].surveyls_description;
	//alert(surveys_languagesettings[0].surveyls_description);
	var line = strSurveyConfig.split("#");
	for (var linekey in line)
	{
		line2 = line[linekey].split(":");
		if (line2[0]!= "")
		{
			line20=line2[0];
			line21=line2[1];
			config[line20] = line21;
		}
	}
	return config;
}

function getQuestionConfig(qhelp)
{
	var config = {};
	//var strSurveyConfig = question.help;
	//alert(surveys_languagesettings[0].surveyls_description);
	var line = qhelp.split("#");
	for (var linekey in line)
	{
		line2 = line[linekey].split(":");
		if (line2[0]!= "")
		{
			line20=line2[0];
			line21=line2[1];
			config[line20] = line21;
		}
	}
	return config;
}
