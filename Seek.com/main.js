const urls = require('../constants').urls;
//const elements = require('./elements');
//const job_categories = require('../models/job_categories');
//const main_helpers = require('../helpers/main_helpers');
const db_helper = require('./controller');

exports.go = async function(page, close) {
/*	
	main_helpers.asyncForEach(job_categories, async (category) => {

		await page.goto(urls.SEEK + category + '-jobs'); //going directly from a URL is faster than typing and searching.

		const title = await page.title();
		console.log("title: " + title);

		//custom query from url to check for number of jobs.

		await page.waitForSelector(elements.no_of_jobs);
		const textContent = await page.evaluate(e => {
			console.log("element: " + e);
			return document.querySelector( e ).textContent; 
		}, elements.no_of_jobs);

		//TODO save to firebase live DB - so results are reflected on clientside UI
		//date saved
		console.log( 'number of results = ' + textContent );

	});
*/
	const pushId = Date.now().toString();

	//TODO for loop to use AUS url and do the same tasks.
	await page.goto(urls.SEEK_NZ);

	const title = await page.title();
	//console.log("title: " + title);

	//click dropdown label
	const dropdown = await page.waitForSelector('#SearchBar__Classifications');

	await dropdown.click();

	//first level jobs.
	const dropdownDiv =  await page.waitForSelector('._3cvRF2q > span > span'); //#classificationsPanel > 
	var dropLi = await page.$$('li[data-automation="item-depth-0"]');//'._3cvRF2q > span > span');
	//var jobCounts = await page.$$('._3v2SJ91 > span > span');
	for(var i = 0; i < dropLi.length; i++){ //cant loop from back, even though would be easier...because have to scrolll
		let category = await page.$$('._3cvRF2q > span > span');
		var categoryText = await category[i].getProperty('innerText');
		categoryText = await categoryText.jsonValue();
		page.waitFor(500);
		console.log("big category: " + categoryText);
		const bigCategory = categoryText;

		let jobCount = await page.$$('._3v2SJ91 > span > span');
		jobCount = await jobCount[i].getProperty('innerText');
		jobCount = await jobCount.jsonValue();
		console.log('jobs: ' + jobCount);
		const totalJobCount = jobCount;

		//sub-category tier jobs
		await category[i].click();
		await page.waitForSelector('li[data-automation="item-depth-1"]');//'._3cvRF2q > ul > li > ._3cvRF2q');
		
		const subCategories = await page.$$('li[data-automation="item-depth-1"]');
		console.log("subCategories.length: " + subCategories.length);
		const subCategoryData = [];

		for(var z = 0; z < subCategories.length; z++){
			let subCategoryText = await page.$$('li[data-automation="item-depth-1"] > a > span'); //'._3cvRF2q > ul > li > ._3cvRF2q > span > span'
			subCategoryText = await subCategoryText[z].getProperty('innerText');
			subCategoryText = await subCategoryText.jsonValue();
			console.log("subcategory: " + subCategoryText);

			let subJobCount = await page.$$('li[data-automation="item-depth-1"] > span > span');//'._3cvRF2q > ul > li > ._3cvRF2q > span:nth-child(2) > span'
			subJobCount = await subJobCount[z].getProperty('innerText');
			subJobCount = await subJobCount.jsonValue();
			console.log("sub job: " + subJobCount); 
			
			subCategoryData.push({
				subCategory: subCategoryText.replace(/\//g, '-'),
				subCategoryJobCount: subJobCount
			});

			page.waitFor(1000);
		}

		//click to close category to be able to continue reading.
		await category[i].click();

		//save each big category to DB with small categories included
		var data = {
			pushId: pushId,
			subCategories: subCategoryData,
			bigCategory: bigCategory.replace(/\//g, '-'),
			totalJobCount: totalJobCount
		};

		db_helper.writeBigCategoryWithSmallCategories(data);
	}

	//close();
};	

