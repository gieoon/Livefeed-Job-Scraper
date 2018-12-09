const urls = require('../constants').urls;
const elements = require('./elements');
const main_helpers = require('../helpers/main_helpers');
const db_helper = require('./controller');

exports.go = async function(page, close) {

	//generate unique instance of DB for this scrape
	const pushId = Date.now().toString();
	console.log('uniqueId: ' + pushId);

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
	//await page.waitFor(1000); //necessary

	const years = await formFrame.evaluate((length) => {
		const tempValues = [];
		for(var i = 2; i <= length; ++i){
			tempValues.push(document.querySelector('select#year option:nth-child(' + i + ')').value);
		}
		return tempValues;
	}, options.length);
	
	//set year to newest year for now
	//if same no of grads...because iframe doesnt refresh, the don't count, makeshift solution
	var currentNo = 0;
	for(var y = 0; y < years.length; y++){
		for(var i = 0; i < qualifications.length; i++){
			//select each qualification for each year;
			await formFrame.select('select#year', years[y]);
			await formFrame.select('select#qualCode', qualifications[i]);
			//click 'search'
			const btn = await formFrame.waitForSelector('input#searchBtn');
			btn.click();
			//await page.waitFor(100);

			//get the result from the bottom
			const gradDiv = await formFrame.waitForSelector('#graduationPagination');

			const span = await formFrame.waitForSelector('span > b');
			
			var noOfGrads = await formFrame.evaluate(()=> document.querySelectorAll('span > b')[2].innerHTML);
			if(noOfGrads == currentNo){
				noOfGrads = 0;
			}
			else {
				//set new number;
				currentNo = noOfGrads;
			}

			// var qualTitle = '';
			// if(i === 0){
			// 	qualTitle = 'total'
			// }
			//else{
				qualTitle = await formFrame.evaluate(() => 
					document.querySelectorAll('div#searchQuery> b')[1].innerHTML
				);
			//}
			
			console.log('qual title: ' + qualTitle);
			console.log("noOfGrads:", noOfGrads);

			var data = {
				pushId: pushId,
				year: years[y],
				qualification: qualTitle.replace(/\//g, '-'), // /g means replace every value, and replace the slash, escaped with backslash
				noOfGrads: noOfGrads
			}

			db_helper.writeStudentsInYear(data);
		}
	}
	

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
