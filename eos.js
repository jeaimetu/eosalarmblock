var Eos = require('eosjs') // Eos = require('./src')
var blockParse = require('./blockParse.js');

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

const chainLogging = true;
const runTimer = 200;

// EOS
EosApi = require('eosjs-api')
eosconfig = {
 	httpEndpoint: "https://mainnet.eoscalgary.io",
	expireInSeconds: 60	
}

eos = EosApi(eosconfig)

// Getting starting block id
var isFirstRun = true;

var previousReadBlock = -1;

function forceGC(){
   if (global.gc) {
	   const heapMem = process.memoryUsage().heapTotal/(1024*1024);
	   const rssMem = process.memoryUsage().rss/(1024*1024);	   
	console.log("Memory heap usage ", heapMem);
 	console.log("Memory rss usage ", rssMem);
	   if(heapMem > 300*1024*1024 || rssMem > 300*1024*1024)
      		global.gc();
   } else {
      console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
   }
}

//set initial block
function getLatestBlock(){
 eos.getInfo({}).then(result => {
  	startIndex = result.head_block_num;
  if(chainLogging == true)
   console.log("getinfo block", previousReadBlock);
  if(previousReadBlock <  startIndex){
   //idx = startIndex;
   //read block

   console.log("calling saveBlockInfo for block number", startIndex);
   saveBlockInfo(startIndex);
  }else{

   if(chainLogging == true)
    console.log("Do nothing", "previousReadBlock", "startIndex", "idx",previousReadBlock,startIndex) ;//do nothing
  }
 }).catch((err) => {

  if(chainLogging == true)
   console.log("getInfo failed");
  console.log(err);

 });
}


function insertAlarm(res, account, block, data, type){
	let result = res.slice();
	MongoClient.connect(url, function(err, db) {
		if(result == null){
			console.log("there is no matched one ", account);
			db.close();
			return;
		}else{
			var dbo = db.db("heroku_6wpccsrg");
			console.log("before enter for loop", result);
			console.log("before enter for loop", result[0], result);
			for(i = 0;i < result.length;i++){
				var fData = formatData(data, type);
				//if(result[i] === undefined){
					console.log("result is undefined", result[i], account);
					//continue;
				//}else{
					console.log("calling insertone", account);
					var myobj = { chatid : result[i].chatid, block : block, account : account, data : fData, report : false };
					dbo.collection("alarm").insertOne(myobj, function(err, res){
						if (err) throw err;
						console.log("one document inserted to alarm db ", account);
						db.close();
					});					
				//}
			}
					
		}
	});	
}
function saveData(block, account, data, type){ 
  //var fData = formatData(data, type);
  //botClient.sendAlarm(account, fData);
 /* Temporary disable saving data to MongoDB due to the size limit
 after find one and if available then save */
	console.log("calling saveData for account", account);
	forceGC();
	MongoClient.connect(url, function(err, db) {
		var dbo = db.db("heroku_6wpccsrg");
		var findquery = {eosid : account};
		dbo.collection("customers").find(findquery).toArray(function(err, result){
			if(err) throw err;
			insertAlarm(result.slice(), account, block, data, type);
			db.close();//all continue case;
		});
	}); 
}
 
function checkAccount(result){
   //idx++;
	if(chainLogging == true)
		console.log("checkAccount", result);
 if(result.transactions.length == 0){	
 	return;
 }else{
 	if(chainLogging == true)
  		console.log("transaction length ", result.transactions.length);
	if(typeof result.transactions === 'undefined' || result.transactions.length == 0){		
		return;
	}

	var trx;
  	for(i = 0;i<result.transactions.length;i++){
  	//check transaction type
  		trx = result.transactions[i].trx.transaction;
		if(typeof trx === 'undefined')
			continue;
		if(trx.actions === null || trx.actions.length == 0 || typeof trx.actions === 'undefined')
			continue;
		
		var type, data;
   		for(j=0;j<trx.actions.length;j++){

    			if(chainLogging == true)
    				console.log("action length", trx.actions.length);
    			if(typeof trx.actions[j] ===  'undefined' || trx.actions[j].length == 0)
     				continue;    
			
  			type = trx.actions[j].name;
  			data = trx.actions[j].data; 
      			//filtering malicious event
      			if(type == "ddos" || type == "tweet")
       				continue;
  				var account = null;
			var accountFrom = null;
  				if(type == "transfer" || type == "issue" ){
  					account = data.to;
					accountFrom = data.from;
  				}else if(type == "newaccount"){
  					account = data.creator;
  				}else if(type == "voteproducer"){
  					account = data.voter;  
  				}else if(type == "undelegatebw" || type == "delegatebw"){
  					account = data.from;
  				}else if(type == "ddos"){
  					account = trx.actions[0].account;
  				}else if(type == "bidname"){
  					account = data.bidder;
  				}else if(type == "awakepet" || type == "feedpet" || type == "createpet"){
  					account = trx.actions[j].authorization[0].actor;
  				}else if(type == "refund"){
  					account = data.owner;
  				}else if(type == "buyram" || type == "buyrambytes"){
  					account = data.payer;
  				}else if(type == "sellram" || type == "updateauth"){
  					account = data.account;
  				}else{      
      				account = blockParse.getAccountInfo(data);    
  				}//end of else
  
  				if(account != null && type != "ddos" && type != "tweet"){     
   					//console.log("calling sendalarm in eosjs", account);
   					saveData(result.block_num, account, data, type);
					account = null;
					if(accountFrom != null){
						saveData(result.block_num, accountFrom, data, type);
					}
 			  	}else{
					
				}//end of if
   			}//end of for, actions
 	}//end of for of transaction
 }//end of else 
}//end of function


 
function saveBlockInfo(blockNo){
 //console.log("saveBlockInfo for ",idx);
 eos.getBlock(blockNo).then(result => {
  retryCount = 0;
  if(chainLogging == true)
   console.log("read block suceess for block number", blockNo);
  checkAccount(result);
  //saving the latest success block number.
  previousReadBlock = blockNo;
  //idx++;

  })
 .catch((err) => {

  if(chainLogging == true)
   console.log("getblockfailed");

  console.log(err);

 }); // end of getblock
} //end of function

function formatData(data, type){
  if(type == "transfer"){
   msg = "송금 이벤트";
   msg += "\n";
   msg += "받는사람 : " + data.to;
   msg += "\n";
   msg += "보내는사람 : " + data.from;
   msg += "\n";
   msg += "송금 수량 : " + data.quantity;
   msg += "\n";
   msg += "메모 : " + data.memo
  }else if(type == "newaccount"){
   msg = "신규 계정 생성 이벤트";
   msg += "\n";
   msg += "생성한 계정 : " + data.name;
  }else if(type == "voteproducer"){
   msg = "투표 이벤트";
   msg += "\n";
   msg += "투표한 대상";
   msg += "\n";
   for(i = 0;i < data.producers.length;i++){
    msg += data.producers[i] + ", ";
   }
  }else if(type == "undelegatebw"){
   msg = "EOS 잠금 해제 이벤트";
   msg += "\n";
   msg += "네트워크 잠금 해제 : " + data.unstake_net_quantity
   msg += "\n";
   msg += "CPU 잠금 해제 : " + data.unstake_cpu_quantity
   
  }else if(type == "delegatebw"){
   msg = "EOS 잠금 이벤트";
   msg += "\n";
   msg += "네트워크에 잠금 : " + data.stake_net_quantity
   msg += "\n";
   msg += "CPU에 잠금 : " + data.stake_cpu_quantity
  }else if(type == "issue"){
   msg = "이슈 이벤트";
   msg += "\n";
   msg += "수량 : " + data.quantity;
	  msg += "\n";
   msg += "메모 : " + data.memo;
  }else if(type == "bidname"){
   msg = "계정 경매 이벤트";
   msg += "\n";
   msg += "계정 : " + data.newname   
   msg += "\n";
   msg += "경매 참여 수량 : " + data.bid
  }else if(type == "awakepet"){
   msg = "펫을 깨우셨습니다.";
  }else if(type == "createpet"){
   msg = "펫을 만드셨습니다. ";
   msg += data.pet_name;   
  }else if(type == "refund"){
   msg = "환불 이벤트";
  }else if(type == "updateauth"){
   msg = "당신의 권한 정보가 갱신되었습니다.";
   msg += "\n";
   msg += "Public Key " + data.auth.keys[0].key;
  }else if(type == "sellram"){
   msg = "램을 파셨습니다.";
   msg += "\n";
   msg += "수량 " + data.bytes;
  }else if(type == "buyram" || type == "buyrambytes"){
   msg = "램을 구매했습니다.";
   msg += "\n";
   msg += "수량 " + data.bytes + "bytes" + " to " + data.receiver;
  }else{
   //console.log("need to be implemented");
   msg = "이 이벤트는 곧 더 예쁜 포멧으로 지원 예정입니다.";
   msg += "\n";
   msg += "이벤트 종류 : " + type;
   msg += "\n";
   //json object to stringfy
   var buf = Buffer.from(JSON.stringify(data));


	  
   msg += buf;
  }
	
	return msg;
	
}

function deleteReportedAlarm(){
	MongoClient.connect(url, function(err, db) {
		var dbo = db.db("heroku_6wpccsrg");
		var findquery = {report  : true};
		dbo.collection("alarm").deleteMany(findquery, function(err, obj) {
			if (err) throw err;
			console.log("reported alarm deleted");
			db.close();
		});
	});	
}
                        
setInterval(getLatestBlock, runTimer);
setInterval(deleteReportedAlarm, 3600000); //per an hour, delete reported alarm


