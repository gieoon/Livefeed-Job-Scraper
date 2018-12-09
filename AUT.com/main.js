const urls = require('../constants').urls;
const elements = require('./elements');

exports.go = async function(page, close) {
	console.log("going to aut");
	await page.goto(urls.AUT_DB);
	await page.waitForSelector('h1');//page.title;
	const title = await page.$eval('h1', (element) => { return element.innerHTML; });
	console.log("title: " + title);


	const mainDiv = await page.waitForSelector('div#mainContent');
	console.log("found main div");

	var frames = await page.frames();
	var formFrame = await frames.find(f=> f._url === 'https://agentonline.aut.ac.nz/GraduationConfirmation/GraduationConfirmation/Default.aspx');

	const checkbox = await formFrame.waitForSelector('input[type="checkbox"]');

	await (await checkbox.getProperty('checked')).jsonValue();
	await checkbox.click();

	const submitBtn = await formFrame.waitForSelector('input[type="submit"]');
	submitBtn.click();


	//now in main area
	frames = await page.frames();
	var formFrame2 = await frames.find(f=> f._url === 'https://agentonline.aut.ac.nz/GraduationConfirmation/GraduationConfirmation/Default.aspx');

	const yearSelect = await formFrame2.waitForSelector('select#Years');
	const yearOptions = await yearSelect.$$('option');
	const years = await formFrame2.evaluate((length) => {
		const tempYears = [];
		for(var i = 2; i <= length; ++i){
			tempYears.push(document.querySelector('select#Year option:nth-child(' + i + ')').value);
		}
		return tempYears;
	}, yearOptions.length);

	//const yearSelect = 

}