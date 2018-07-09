const Telegraf = require('telegraf');   // Module to use Telegraf API.
const config = require('./config'); // Configuration file that holds telegraf_token API key.
const session = require('telegraf/session')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Composer = require('telegraf/composer')
const WizardScene = require('telegraf/scenes/wizard')
const Stage = require('telegraf/stage')


var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

Eos = require('eosjs') // Eos = require('./src')


eosconfig = {
httpEndpoint: "http://mainnet.eoscalgary.io"
}
 
eos = Eos(eosconfig) // 127.0.0.1:8888


const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Account', 'id'),
  Markup.callbackButton('Price', 'price'),
  Markup.callbackButton('Balance', 'balance'),
  Markup.callbackButton('Setting', 'setting'),
  Markup.callbackButton('Token','token'),
  Markup.callbackButton('RAM Price','ram')
  //Markup.callbackButton('Confirm','confirm')
])


function makeMessage(ctx){
  
  var finalResult;
 
 if(ctx.session.id != "nil"){
    finalResult = "Current account : " + ctx.session.id;
  finalResult += "\n";
 finalResult += "\n";
  finalResult += "**Please vote eoscafeblock**, eosyskoreabp, eosnodeonebp, acroeos12345.";
   finalResult += "\n";
  finalResult += "copyright EOS.Cafe Korea";
  
 }
 else{
  finalResult = "Current account : " + ctx.session.id;
  finalResult = "Touch an account button to register EOS account.";
 finalResult += "\n";
  finalResult += "**Please vote eoscafeblock**, eosyskoreabp, eosnodeonebp, acroeos12345.";
   finalResult += "\n\n";
    finalResult += "copyright EOS.Cafe Korea";
 }
  return finalResult;
}

function initMessage(ctx){
 ctx.session.id = 'nil';
 ctx.session.transaction = 'nil';
}

function checkData(ctx){
  if(ctx.session.email == "nil")
    return false;
  if(ctx.session.etw == "nil")
    return false;
  if(ctx.session.bts == "nil")
    return false;
  if(ctx.session.ncafe == "nil")
    return false;
  if(ctx.session.email == null)
    return false;
  if(ctx.session.etw == null)
    return false;
  if(ctx.session.bts == null)
    return false;
  if(ctx.session.ncafe == null)
    return false;
  return true;
}

//Get token balance
async function getAddBalance(account){
 let bal = await eos.getTableRows({json : true,
                      code : "eosadddddddd",
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});
 if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}

async function getDacBalance(account){
 let bal = await eos.getTableRows({json : true,
                      code : "eosdactokens",
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});;
  if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}

async function getTokenBalanceEach(account, tokenCode){
 let bal = await eos.getTableRows({json : true,
                      code : tokenCode,
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});;
  if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}

async function getCetBalance(account){
 let bal = await eos.getTableRows({json : true,
                      code : "eosiochaince",
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});;
  if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}

async function getCetosBalance(account){
 let bal = await eos.getTableRows({json : true,
                      code : "gyztomjugage",
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});;
  if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}


async function getTokenBalance(account, cb){
 let [addBalance, dacBalance, cetosBalance,cetBalance, ednaBalance, horusBalance,eoxbalance] = 
     await Promise.all([getAddBalance(account), 
                        getDacBalance(account), 
                        getCetosBalance(account),
                        getCetBalance(account),
                        getTokenBalanceEach(account, "ednazztokens"),
                        getTokenBalanceEach(account, "horustokenio"),            
                        getTokenBalanceEach(account, "eoxeoxeoxeox")]);
console.log(addBalance, dacBalance, cetosBalance);
 msg = "Token Balance";
 msg += "\n";
 msg += "Current account : " + account;
 msg += "\n";
 if(addBalance != null)
 msg += addBalance;
 else
  msg += " 0 ADD";
 msg += "\n";
 
  if(ednaBalance != null)
 msg += ednaBalance;
 else
  msg += " 0 EDNA";
 msg += "\n";
 
   if(horusBalance != null)
 msg += horusBalance;
 else
  msg += " 0 HORUS";
 msg += "\n";
 
     if(eoxbalance != null)
 msg += eoxbalance;
 else
  msg += " 0 EOX";
 msg += "\n";
 
 
 
 if(dacBalance != null)
 msg += dacBalance;
else
  msg += " 0 EOSDAC";
  msg += "\n";
if(cetosBalance != null)
 msg += cetosBalance;
else
  msg += " 0 CETOS";
  msg += "\n"; 
 if(cetBalance != null)
 msg += cetBalance;
else
  msg += " 0 CET";
 cb(msg);
}
//Get token balance

function loadData(ctx, cb){
 MongoClient.connect(url, function(err, db) {
 var dbo = db.db("heroku_9472rtd6");
 var findquery = {chatid : ctx.chat.id, primary : true};
 dbo.collection("customers").findOne(findquery, function(err, result){
  if(result == null){
   //if result is null, then return -1
   var findqueryInTheLoop = {chatid : ctx.chat.id};
   dbo.collection("customers").findOne(findqueryInTheLoop, function(err, result){
    if(result == null){
   var msg = "Please set your primary account in setting menu";
   ctx.telegram.sendMessage(ctx.from.id, msg)
   cb(-1);
    }else{
     cb(result.eosid);    
    }
    db.close();
   });
   
  }else{
   cb(result.eosid);
  }
  db.close();
 });
 });
}

function getRamPrice(ctx){
eos.getTableRows({json : true,
                 code : "eosio",
                 scope: "eosio",
                 table: "rammarket",
                 limit: 10}).then(res => {
 msg = "RAM Price : ";
 var a1 = res.rows[0].quote.balance.split(" ");
 var a2 = res.rows[0].base.balance.split(" ");
 var a3 = (parseFloat(a1[0]) / parseFloat(a2[0])) * 1024;
 msg += a3.toFixed(4);
 msg += " EOS per KiB";

 //console.log(res);
 //console.log(res.rows[0].base);
 //console.log(res.rows[0].quote);
 


 ctx.telegram.sendMessage(ctx.from.id, msg)
 msg = makeMessage(ctx);
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard));
});
}

function saveData(ctx){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("heroku_9472rtd6");
 
   var findquery = {chatid : ctx.chat.id, eosid : ctx.session.id, primary : true};
   dbo.collection("customers").findOne(findquery, function(err, result){
    if(result == null){
     //insert
        var myobj = { chatid : ctx.chat.id, eosid : ctx.session.id, primary : true }
     dbo.collection("customers").insertOne(myobj, function(err, res) {
        if (err) throw err;
          console.log("1 document inserted");
              db.close();
        });
    }/*else{
     //update
     var newobj = {$set : {chatid : ctx.chat.id, eosid : ctx.session.id }};        
     dbo.collection("customers").updateOne(findquery, newobj, function(err, res) {
        if (err) throw err;
          console.log("1 document updated");
          db.close();
        });
    } //end else*/
   }); //end pf findquery
  }); //end MongoClient
}

function setPrimary(ctx, account){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("heroku_9472rtd6");
 //, eosid : ctx.session.id, primary : true};
   var updateQuery = {chatid : ctx.chat.id };
   var newvalues = {$set : {primary : false}};
   dbo.collection("customers").updateMany(updateQuery, newvalues,function(err, res){
    var findquery = {eosid : account};
    var pValue = {$set : {primary : true }};
    dbo.collection("customers").updateOne(findquery, pValue, function(err, result){
     console.log("Primary flag update completed", ctx.session.id);
     msg = account;
     msg += "**is primary account now setted**";
     ctx.session.id = account;
     ctx.telegram.sendMessage(ctx.from.id, msg, parse_mode = "Markdown", Extra.HTML().markup(keyboard))
     db.close();  
   }); //end of updateOne
   }); //end of updateMany query
   
  }); //end MongoClient
}

function deleteAccount(ctx, account){
 MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("heroku_9472rtd6");
  var deleteQuery = {eosid : account};
  dbo.collection("customers").deleteOne(deleteQuery, function(err, res){
   if(err) throw err;
   console.log("delete account", account);
   msg = account;
   msg += " is deleted";
   ctx.session.id = "nil";
   ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard))
   db.close
  });
 });
 
}

//check current step and save value to context
function stepCheck(ctx){
  if(ctx.session.step == 4){
    console.log("email",ctx.message.text);
    ctx.session.email = ctx.message.text;
  }else if(ctx.session.step == 3){
        ctx.session.etw = ctx.message.text;
  }else if(ctx.session.step == 2){
   ;
    
  }else if(ctx.session.step == 1){
    ctx.session.id = ctx.message.text;
    saveData(ctx);
    console.log("id",ctx.message.text);
   msg = ctx.session.id + " is successfuly registered";
    ctx.telegram.sendMessage(ctx.from.id, msg)
    //save id to mongo DB
  }else{
    console.log("other data");
  }
}

//bot init
const bot = new Telegraf(config.telegraf_token);    // Let's instantiate a bot using our token.
bot.use(session())
//bot.use(Telegraf.log())



module.exports.sendAlarm = function(account, msg){
 //get chatid
 MongoClient.connect(url, function(err, db) {
  var dbo = db.db("heroku_9472rtd6");
  var findquery = {eosid : account};
  dbo.collection("customers").find(findquery).toArray(function(err, result){
   if(result.length == 0){
    //console.log("no matched account for ", account);
    ;
   }else{
     //send message
    for(i = 0;i < result.length; i++){
     bot.telegram.sendMessage(result[i].chatid, msg);
    }
   }
   db.close();
  });//end of findOne
   
 });//end of mongoclient
 
}



bot.start((ctx) => {

  //save etc values
  ctx.session.telegram = ctx.message.chat.username;
  ctx.session.language = ctx.message.from.language_code;
  initMessage(ctx);
  var msg = makeMessage(ctx);
  loadData(ctx, function(id){
   ctx.session.id = id;
  ctx.telegram.sendMessage(ctx.from.id, msg, parse_mode = "Markdown", Extra.markup(keyboard))
  });
  
  ctx.reply('Hello')
})

bot.on('message', (ctx) => {
  stepCheck(ctx);

  var msg = makeMessage(ctx);
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard))
});



function makePriceMessage(res){


 msg = "EOS Price : " + "$" + res[0].usd;
 msg += "\n";
 msg += "EOS Price : " + Math.floor(res[0].krw) + "KRW";
 msg += "\n";
 msg += "Provided by ";
 msg += res[0].exchange;
 msg += "\n";
 msg += "EOS Selling Price : " + res[1].krw + "KRW";
 msg += "\n";
 msg += "EOS Buying Price : " + res[1].krwbuy + "KRW";
  msg += "\n";
 msg += "Provided by " + res[1].exchange;
 //diff =  res[0].krw - res[1].krw;
 
 
 //msg += "Market difference : " + diff + "KRW";
 return msg; 
}

function price(ctx){
     ctx.reply("Retrieving EOS price...");
      //get price
   MongoClient.connect(url, function(err, db) {
    var dbo = db.db("heroku_9472rtd6");       
    dbo.collection("price").find().toArray(function(err, res){
     console.log(res)
     msg =  msg = "Current account : " + ctx.session.id;
   msg += "\n";
     msg += makePriceMessage(res);
     ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard));
     ctx.session.step = 2;
     db.close();
    });
   });
}

function balance(ctx){
 loadData(ctx, function(id){
  ctx.session.id = id;
 if(ctx.session.id == -1){
  msg = "Please register your EOS account.";
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard));
 }else{
  ctx.reply("Retrieving account balance...");
  
    eos.getCurrencyBalance("eosio.token",ctx.session.id).then(result => {
     console.log("getCurrencyBalance", result)
     if(result[0] != undefined && result[0] != 'undefined' && result[0] != null){
      v3 = result[0].split(" ");
     }else{
      v3 = ["0", "EOS"];
     }
     console.log("calling getAccount", ctx.session.id);
     eos.getAccount(ctx.session.id).then(result => {
      console.log("getAccount", result);
      console.log(result.self_delegated_bandwidth.net_weight, result.self_delegated_bandwidth.cpu_weight, result.voter_info.unstaking)
      v1 = result.self_delegated_bandwidth.net_weight.split(" ");
      v2 = result.self_delegated_bandwidth.cpu_weight.split(" ");
     eos.getTableRows({json : true,
                 code : "eosio",
                 scope: ctx.session.id,
                 table: "refunds",
                 limit: 500}).then(res => {
        var refund;
       if(res.rows.length == 0){
        refund = 0;
       }else{
       var a = res.rows[0].net_amount.split(" ");
       var b = res.rows[0].cpu_amount.split(" ");
       refund = parseFloat(a[0]) + parseFloat(b[0]);
      }
 console.log("refund size", refund)
      //console.log(parseInt(v1[0],10) + parseInt(v2[0],10));
      msg = "Total Balance : ";
      msg += parseFloat(v1[0]) + parseFloat(v2[0]) + parseFloat(v3[0]) + refund;   
      msg += " EOS\n";
      msg += "Unstaked : " + parseFloat(v3[0]);
      msg += " EOS\n";
      msg += "Staking for CPU : "
      msg += result.self_delegated_bandwidth.cpu_weight;
      msg += "\n";
      msg += "Staking for Network : "
      msg += result.self_delegated_bandwidth.net_weight;
      msg += "\n";
      msg += "Refund : ";
      msg += refund;
      ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard));
     });//end of getTableRow
     }); //end of get Account
  }); //end of getCurrencyBalance
   }//end if 계정정보
 }); //end of first load data

//console.log('currency balance', balance);
  ctx.session.step = 3;
}

function token(ctx){
 ctx.reply("Retrieving token balance....");
 loadData(ctx, function(id){
  ctx.session.id = id;
  console.log("Token balance", ctx.session.id);
  getTokenBalance(ctx.session.id,(result)=>{
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard));
   });
 });
}

function account(ctx){
   ctx.reply("Please input EOS account. You can check your account with EOS public key on http://eosflare.io .");

  ctx.session.step = 1;
}

function setting(ctx){
 const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Set Primary Account', 'primary'),
  Markup.callbackButton('Delete Account', 'delete')
], {column: 1});
 msg = "Please select the operation";
 ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard)); 
}

function accountAction(ctx){
  var idListString = [];
      //get price
 console.log("before making ", idListString);
 console.log("setting chat id ", ctx.from.id);
   MongoClient.connect(url, function(err, db) {
    var dbo = db.db("heroku_9472rtd6");     
    var findquery = {chatid : ctx.from.id};
    dbo.collection("customers").find(findquery).toArray(function(err, res){
     console.log(res)
     //make id array

     for(i = 0;i<res.length;i++){
      console.log("setting push data", res[i].eosid);
      idListString.push({text : res[i].eosid, callback_data : res[i].eosid});
     }
         console.log("after making", idListString);
 
    var keyboardStr = JSON.stringify({
      inline_keyboard: [ idListString ]
      
   });
     const keyboardId = Markup.inlineKeyboard(idListString, {column: 3});     
    var msg = "Select your account";
     ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboardId));
    
     //ctx.session.step = 2;
     db.close();
   });


  });
}

bot.on('callback_query', (ctx) => {
 const action = ctx.callbackQuery.data;
 //const msg = ctx.callbackQuery.message;
 //console.log("callbackQeury", callbackQuery);
 
 if(action === "price"){
  price(ctx);

 }else if(action === "balance"){
  balance(ctx)
 }else if(action === "token"){
  token(ctx);
 }else if(action == "id"){
  account(ctx);
 }else if(action == "ram"){
  getRamPrice(ctx);
 }else if(action == "setting"){
  setting(ctx);
 }else if(action == "primary"){
  ctx.session.accountAction = "primary";
  accountAction(ctx);
 }else if(action == "delete"){
  ctx.session.accountAction = "delete";
  accountAction(ctx);
 }else{ 

  if(ctx.session.accountAction === "primary"){
   ctx.session.accountAction = "nil";
   console.log("set primary account case", action);
   setPrimary(ctx, action);
  }else{
   ctx.session.accountAction = "nil";
   console.log("delete account case", action);
   deleteAccount(ctx, action);
  }
  
 }
 
});
// We can get bot nickname from bot informations. This is particularly useful for groups.
bot.telegram.getMe().then((bot_informations) => {
    bot.options.username = bot_informations.username;
    console.log("Server has initialized bot nickname. Nick: "+bot_informations.username);
});



// Start bot polling in order to not terminate Node.js application.
bot.startPolling();
