const urls = require('../constants').urls;
const elements = require('./elements');
const main_helpers = require('../helpers/main_helpers');

exports.go = async function(page, close) {

	await page.goto(urls.UOA_DB); 

	const title = await page.title();
	console.log("title: " + title);
	
	//'https://www.auckland.ac.nz/graduatesearch/'
	//await page.waitForSelector('iframe');
	//this is tough, because it's in an iframe.
	const frames = await page.frames();

	var formFrame = frames.find(f => f._url === 'https://www.auckland.ac.nz/graduatesearch/' );
	//console.dir(formFrame);

	const qualSelect = await formFrame.waitForSelector('select#qualCode');
	const qualOptions = await qualSelect.$$('option'); 
	const qualifications = await formFrame.evaluate((length) => {
		const tempQuals = [];
		for(var i = 2; i <= length; ++i){
			tempQuals.push(document.querySelector('select#qualCode option:nth-child(' + i + ')').value);
		}
		return tempQuals;
	}, qualOptions.length);
	

	const yearSelect = await formFrame.waitForSelector('select#year');
	const options = await yearSelect.$$('option');
	//await formFrame.waitForSelector('select#year > option');
	//await page.waitForNavigation();
	//await page.waitFor(1000);

	const years = await formFrame.evaluate((length) => {
		const tempValues = [];
		for(var i = 2; i <= length; ++i){
			tempValues.push(document.querySelector('select#year option:nth-child(' + i + ')').value);
		}
		return tempValues;
	}, options.length);
	//console.log('values: ', values);
	
	//set year to newest year for now
	await formFrame.select('select#year', years[0]);
	//for(var i = 0; i < qualifications.length; i++){
		//select each qualification for each year;
		await formFrame.select('select#qualCode', qualifications[0]);
		//click 'search'
		const btn = await formFrame.waitForSelector('input#searchBtn');
		btn.click();

		//get the result from the bottom
		const gradDiv = await formFrame.waitForSelector('#graduationPagination');
		//console.log("gradDiv: ", gradDiv);
		//console.dir(gradDiv);
		//const noOfGrads = formFrame.evaluate(() => document.querySelector('span'));
		const span = await formFrame.waitForSelector('span > b');
		//const noOfGrads = await formFrame.$$('span');
		
		const noOfGrads = await formFrame.evaluate(()=> document.querySelectorAll('span > b')[2].innerHTML);
		//console.log("span: ", span);
		console.log("noOfGrads:", noOfGrads);
	//}
	

	//options[0].click();


	// await formFrame.select('select#year', '')


	//TODO save to firebase live DB - so results are reflected on clientside UI
	//date saved
	
	//close();
};	

//await page.focus('#' + elements.input_keyword);
	// await page.keyboard.type(searchText); 
	// //press enter
	// await page.keyboard.type(String.fromCharCode(13));
