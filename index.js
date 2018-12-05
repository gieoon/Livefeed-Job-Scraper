//local imports
const seek = require('./Seek.com/main.js');
const uoa = require('./UoA.com/main.js');

//library imports
const puppeteer = require('puppeteer');
var browser = null;
var count = 0;
const FINISH_VAL = 2;

async function run(close) {
	console.log("launching");
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
    
   

    await page.setViewport({ width, height });;
	

	//seek.go(page, close);
	uoa.go(page, close);
}



async function close() {
	await browser.close();
}

run(function(){
	//if all pages finished, then close
	//can use a count value;
	++count;
	if(count >= 2){
		close();
		count = 0;
	}
});

resize = async () => {

    // Viewport && Window size
    const width = 400
    const height = 600

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--window-size=${ width },${ height }`
        ],
    });

    const page = await browser.newPage();

    // Adaptive?
    // await page.setUserAgent('Mozilla (Android) Mobile')
    
   

    return await page.setViewport({ width, height });;
}
