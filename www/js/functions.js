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
		//tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "idhoraire" INTEGER DEFAULT (0), "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse" INTEGER, "envoi" BOOLEAN not null default 0);');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "idhoraire" VARCHAR, "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse_deb" INTEGER, "tsreponse_fin" INTEGER, "envoi" BOOLEAN not null default 0);');
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
					var groupes = {};
					var next = 0;
					for (var i = 0; i < res2.rows.length; i++)
		            {
						groupe = res2.rows.item(i);
						groupe.config = getQuestionConfig(res2.rows.item(i)['qhelp-question_config']);
						groupe.reponses = JSON.parse(decodeURI(res2.rows.item(i).answers));
						groupes[i] = groupe;
						next = parseInt(res2.rows.item(i).id) + 1;
		            }
					$scope.quiz.groupes = groupes;
					$scope.quiz.next = next;
					$scope.quiz.actif = true;
					console.log('QUIEEE');
					console.log($scope.parent);
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
	
	 async.series([ function(callback){ getQuestionsByGroupe($scope,current,callback);}                            
	],
		 
		function(err, results ){	
		 	
			console.log(results);
			if (debug) alert(JSON.stringify($scope.quiz));
			var timestamp = Math.round(new Date().getTime() / 1000);
		 	$scope.quiz.tsdeb = timestamp;
			$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
			console.log($scope.quiz);
	}
	);//fin  async.series

}


function displayQuestionID($scope,current){

	
	 async.series([ function(callback){ getQuestionsByGroupe($scope,current,callback);}                            
	],
		 
		function(err, results ){		
		 
		 	var timestamp = Math.round(new Date().getTime() / 1000);
		 	$scope.quiz.actif = 'getID';
		 	$scope.quiz.tsdeb = timestamp;
			console.log(results);
			if (debug) alert(JSON.stringify($scope.quiz));
			$scope.$apply(function(){return true;  if (debug) alert('$scope.$apply');});
			console.log($scope.quiz);
	}
	);//fin  async.series

}

function saveReponses(quiz,callback)
{
	console.log('save');
	console.log(quiz);
	var timestamp = Math.round(new Date().getTime() / 1000);
 	quiz.tsfin = timestamp;
	

	db.transaction(function(tx) {
		console.log('quiz????');
		console.log(quiz);
		$.each( quiz.groupes, function( key, groupe ) {
			console.log(quiz);
			console.log(groupe);
			var sql = "";
			//console.log('save ' + this.attr('monID'));
			console.log('save groupe ???????????');
			console.log(groupe);
			console.log('save groupe !!!!!!!!!!');
			reponse = "";
			if (groupe.config.tpl == 'texte')
			{
				console.log('save texte');
				//tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "idhoraire" VARCHAR, "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse_deb" INTEGER, "tsreponse_fin" INTEGER, "envoi" BOOLEAN not null default 0);');
				
				reponse = $('.question[monID="'+groupe.qid+'"] input').val();
				
			}
			if (groupe.config.tpl == 'radio')
			{
				
				console.log('save radio');
				reponse = $('.question[monID="'+groupe.qid+'"] input:checked').val();
			}
			if (groupe.config.tpl == 'slider')
			{
				console.log('save slider');
				reponse = $('.question[monID="'+groupe.qid+'"] input').val();
			}
			sql ='INSERT INTO "reponses" (idhoraire,sid, gid,qid, reponse, tsreponse_deb,tsreponse_fin) '+
			'VALUES('+
			'"'+quiz.uuid+'",'+ //uuid
			'"'+groupe.sid+'",'+ // sid
			'"'+groupe.gid+'",'+ //gid
			'"'+groupe.qid+'",'+ //qid
			'"'+reponse+'",'+ //reponse
			''+quiz.tsdeb+','+ //tsreponse_deb
			''+quiz.tsfin+''+ //tsreponse_fin
			');';
			
			console.log(sql);
			if (sql != "")
			{
				
					(function (reqSql) { 
						tx.executeSql(reqSql,[], successHandler, errorHandler);// requête
					})(sql);
			
			}
		});
	},function(tx){callback(true,'err')},function(tx){callback(null,'ok')});// DB TRANSACTION
	//});// DB TRANSACTION
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

//UUID
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

//ENVOI REPONSES
function sendReponses() {
	console.log('send');
	var aReponses ={};
	db.transaction(function(tx) {
		//tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , 
		//"idhoraire" VARCHAR, "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse_deb" INTEGER, 
		//"tsreponse_fin" INTEGER, "envoi" BOOLEAN not null default 0);');
		//tx.executeSql('SELECT * FROM "horaires" WHERE fait = 1;', [], function(tx, resHoraires) {

		tx.executeSql('SELECT DISTINCT idhoraire FROM "reponses" WHERE envoi = 0', [], function(tx, resHoraires) {
			
			var dataset = resHoraires.rows.length;
			console.log(resHoraires);
            if(dataset>0)
            {     	
            	if (debug)
            		alert("session à  envoi");
            	for(var i=0;i<dataset;i++)
                {
            		//aReponses["sid"] = resHoraires.rows.item(i).uidquestionnaire;
                	//aReponses["timestamp"] = resHoraires.rows.item(i).tsdebut;
                	//saveResHorairesID = resHoraires.rows.item(i).id;
                	
            		tx.executeSql('SELECT * FROM "reponses" WHERE envoi = 0  AND idhoraire = "'+resHoraires.rows.item(i).idhoraire+'";', [], function(tx, res2) {
            			var dataset2 = res2.rows.length;
                        if(dataset2>0)
                        {
                        	saveResHorairesID = res2.rows.item(0).idhoraire;
                        	aReponses["sid"] = res2.rows.item(0).sid;
                        	//aReponses["timestamp"] = res2.rows.item(0).tsreponse;
                        	aReponses["timestamp"] = res2.rows.item(0).tsreponse_deb;
                        	if (debug)
                        		alert("reponse à  envoi");
                        	for(var j=0;j<dataset2;j++)
                            {
                        		//console.log(res2.rows.item(j).sid);
                        		/*if (debug) 
                        			alert(res2.rows.item(j).sid);*/
                                var jsonkey = res2.rows.item(j).sid +"X"+res2.rows.item(j).gid+"X"+res2.rows.item(j).qid;
                                //console.log(jsonkey);
                        		//aReponses[jsonkey]=res2.rows.item(j).reponse;
                                jsonTab = {};
                                jsonTab['tsreponse_deb']=res2.rows.item(j).tsreponse_deb;
                                jsonTab['tsreponse_fin']=res2.rows.item(j).tsreponse_fin;
                                jsonTab['reponse']=res2.rows.item(j).reponse;
                                aReponses[jsonkey]=JSON.stringify(jsonTab);
                                //aReponses[jsonkey]=res2.rows.item(j).tsreponse_deb+","+res2.rows.item(j).tsreponse_fin+","+res2.rows.item(j).reponse;
                            }
                        	console.log("essai envoi"+JSON.stringify(aReponses));
                        	if (debug)
                        		alert("essai envoi"+JSON.stringify(aReponses));
                        	xhr_object = new XMLHttpRequest(); 
                        	//xhr_object.open("GET", "http://mcp.ocd-dbs-france.org/mobile/mobilerpc.php?answer="+JSON.stringify(aReponses), false); 
                        	xhr_object.open("GET", "http://mcp.ocd-dbs-france.org/mobile/restingrpc.php?answer="+JSON.stringify(aReponses), false); 
                        	xhr_object.send(null); 
                        	console.log("send rep");
                        	console.log(xhr_object);
                        	console.log(JSON.stringify(aReponses));
                        	if(xhr_object.readyState == 4) 
                        	{
                        		console.log('Requête effectuée !');
                        		//if(!isMobile) 
                        		//	alert("Requête effectuée !"); 
                        		if(xhr_object.response == "1") 
                        			{
                        			//tx.executeSql('UPDATE "reponses" SET envoi = 1 WHERE idhoraire = '+saveResHorairesID+';');
                        			console.log('UPDATE "reponses" SET envoi = 1 WHERE idhoraire = '+saveResHorairesID+';');
                        			if (debug)
                        				alert('UPDATE "reponses" SET envoi = 1 WHERE idhoraire = '+saveResHorairesID+';');
                        			}
                        	}
                        	
                        }
            			
            		});
            		
                }
            }
		});
	});
};