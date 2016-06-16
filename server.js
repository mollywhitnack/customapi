'use strict'

const moment = require('moment');
const request = require('request');
const PORT = 8000;
const http = require('http');
const path = require('path');
const md5 = require('md5');
const fs = require('fs');
const spellChecker = require('spellchecker');
const swearjar  = require('swearjar');
var wordnet = require('wordnet');


let server = http.createServer(function(req, res){
  
  let[, op, ...params] = req.url.split('/');

  switch(op){
    case 'square':
      let square = Math.pow(params[0], 2);
      res.write(`${params[0]} squared is ${square}`);
      res.end(); 
      break;
    case 'cube':
      let cube = Math.pow(params[0], 3);
      res.write(`${params[0]} cubed is ${cube}`);
      res.end(); 
      break;
    case 'double':
      let double = params[0]*2;
      res.write(`${params[0]} doubled is ${double}`);
      res.end(); 
      break;
    case 'divide':
      let div = parseInt(params[0])/parseInt(params[1]);
      res.write(`${params[0]} divided by ${params[1]} is ${div}`);
      res.end(); 
      break;
    case 'sum':
      var sum = params.reduce( (prev, curr) => parseInt(prev) + parseInt(curr));
      res.write(`Sum: ${sum}`);
      res.end()
      break;
    case 'quote':
      let url2 = `http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=${params[0]}`;
        //this will happen asyncronously 
      request(url2, function (err, response, body){
        //dont want to set a 500 code, if server breaks it will send a 500 automatically
        //can set 400, general purpose error code
        if(err){
          res.statusCode = 400;
          res.write(err);
            //return console.log(err);
        }else{
          console.log(body);
          res.write(`Stock Quote: ${body}`);
        }
        res.end(); 
      });
      break;
    case 'gravatar':
      var hash = md5(`${params[0]}`);
      let url = `http://www.gravatar.com/avatar/${hash}`;
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(`<html><img src="${url}">`);
      res.end('</html>');
      break;
    case 'sentance':
      var sentance = decodeURI(params[0]);
      //console.log(sentance.length);
      var words = sentance.split(' ');
      var wrdcnt = words.length;
      console.log(words[0].length);
      //var charcnt = words.reduce((a,b)=>((a.length)+(b.length)));
      //var charcnt = words.reduce( (prev, curr) => prev.length + curr.length )
      var charcnt = 0;
      for(var i =0; i<words.length; i++){
        var letters = words[i].split('')
        charcnt+=letters.length;
      }
      var avgLen = charcnt/wrdcnt;
      console.log(charcnt);
      res.write(`Word Count: ${wrdcnt} `);
      res.write(`Char count: ${charcnt} `);
      res.write(`Avg word length: ${avgLen.toFixed(2)} `);
      res.end()
      break;
    case 'age':
      let age = params[2] +params[1]+params[0];
      var time = (moment(age, "YYYYMMDD").fromNow()); // 5 years ago
      res.write(`Born ${time}`);
      res.end()
      break;
    case '8ball':
      var ans = ['Yes','No', 'Maybe', 'Ask Again Later'];
      var rand  = Math.floor(Math.random() * ans.length);
      res.write(`${ans[rand]}`);
      res.end()
      break;
    case 'spellCheck':
      var sentance = decodeURI(params[0]);
      console.log(sentance.split(' '));
      var words = sentance.split(' ');
      for(var i = 0; i<words.length;i++){
        if(spellChecker.isMisspelled(words[i])){
          res.write(`Misspelled word: ${words[i]} --`);
          console.log(spellChecker.getCorrectionsForMisspelling(words[i]));
          var corrections  = spellChecker.getCorrectionsForMisspelling(words[i]);
          res.write(` Possible Corrections: ${corrections.toString()}`);
          }
      }
      res.end()
      break;
    case 'swearWord':
      var sentance = decodeURI(params[0]);
      var clean = swearjar.censor(sentance);
      res.write(`${clean}`);
      res.end();
      break;
    case 'dictonary':
      var sentance = decodeURI(params[0]);
      //console.log(words);
      res.write(`${sentance}: `);
      var def = wordnet.lookup(sentance, function(err, definitions) {
        if(err) return console.log(err);
        definitions.forEach(function(definition) {

          res.write(definition.glossary);
        });
        
        res.end();
      });
      break;
    default:
       res.end();  
  }
  
});

//tell it what port
server.listen(PORT, err=>{
  console.log(`Server listening on port ${PORT}`);
});


