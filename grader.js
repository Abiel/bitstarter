#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var Type = require('type-of-is');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://thawing-brushlands-1365.herokuapp.com";


var assertValidURL = function(url){
    return url;
}

var getURLContent = function(url, checkFile){
    rest.get(url).on('complete',  function(result) {
    if (result instanceof Error) {
	console.log('Error: ' + result.message);
	process.exit(1);
    } else {
	//console.log("URL -->" + result);
	 var checkJson = checkHtmlcontent(result, checkFile);
         var outJson = JSON.stringify(checkJson, null, 4);
         console.log(outJson);
	return result;
    }
})

};


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
//    console.log("assert returning-->"+instr);
   return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
//    console.log("content of html file: " + htmlfile);
//    return htmlfile;
};


var cheerioHtmlcontent = function(htmlcontent) {
    return cheerio.load(htmlcontent);
};



var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    //console.log("typeis:" + Type(htmlfile));
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	//console.log('checking-->' + checks[ii] + "found: " + $(checks[ii]).length);
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};


var checkHtmlcontent = function(htmlcontent, checksfile) {
    $ = cheerioHtmlcontent(htmlcontent);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        //console.log('checking-->' + checks[ii] + "found: " + $(checks[ii]).length);
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};



var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


var contains = function(array, value){

    array.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
	if(val==value){
	    return true;
	    }
    });

}; 


if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_content>', 'Path to url', clone(assertValidURL), URL_DEFAULT)
        .parse(process.argv);

process.argv.forEach(function(val, index, array) {

        if(val=="--file"){
	    //call is made for file input 
	    var checkJson = checkHtmlFile(program.file, program.checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	}else if(val=="--url"){
	    //call is made for uri input.
	    getURLContent(program.url, program.checks);
	}
});


    //console.log("program.file-->" + program.file);
    //console.log("program.checks-->" + program.checks);
    //console.log("program.url-->" + program.url);
    //console.log("is file-->" + contains(process.argv, "--file")); 
    //var checkJson = checkHtmlFile(program.file, program.checks);
    //var outJson = JSON.stringify(checkJson, null, 4);
    //console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
