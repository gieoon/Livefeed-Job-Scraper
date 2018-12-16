//local imports
const db = require('./DB/firestore');
const seek = require('./Seek.com/main.js');
const indeed = require('./Indeed.com/main.js');
const trademe = require('./tradeMe.com/main.js');
const uoa = require('./UoA.com/main.js');
const aut = require('./AUT.com/main.js');
const controller = require('./global_controller');
//library imports
const puppeteer = require('puppeteer');
var browser = null;
var count = 0;
const FINISH_VAL = 2;
const startTime = Date.now();

async function run(close) {
	console.log("================== LAUNCHING ===================");
	//browser = await puppeteer.launch({ headless: false });
	//const page = await browser.newPage();

	// Viewport && Window size
    const width = 1400
    const height = 1600

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--window-size=${ width },${ height }`
        ],
    });

    const page = await browser.newPage();

    // Adaptive?
    // await page.setUserAgent('Mozilla (Android) Mobile')
    await page.setViewport({ width, height });
		
	//controller.writeCategoriesFromSeekData();	

	//Job Listings
	//await trademe.go(page, close);
	//await indeed.go(page, close);
	await seek.go(page, close);
	//DB
	//await uoa.go(page, close);
    //aut.go(page, close);//requires student username
    close();
}

async function close() {
	console.log('------------------------------------------------------');
	console.log("FINISHED EXECUTION SUCCESSFULLY");
	console.log("Duration elapsed: ", Date.now() - startTime);
	console.log('------------------------------------------------------');
	await browser.close();
}

run(function(){
	//if all pages finished, then close
	//can use a count value;
	// ++count;
	// if(count >= 2){
	// 	close();
	// 	count = 0;
	// }
});
