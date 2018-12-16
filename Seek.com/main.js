const constants = require('../constants');
//const elements = require('./elements');
//const job_categories = require('../models/job_categories');
const main_helpers = require('../helpers/main_helpers');
const db_helper = require('../global_controller');
const urls = constants.urls;
const address = constants.collections.SEEK;
var bigCategoryIndex = 0;
var locations = {};

exports.go = async function(page, close) {

	//TODO for loop to use AUS url and do the same tasks.
	await page.goto(urls.SEEK_NZ);

	const title = await page.title();
	//console.log("title: " + title);

	//click dropdown label
	const dropdown = await page.waitForSelector('#SearchBar__Classifications');
	const pushId = Date.now().toString();
	await dropdown.click();

	const dropdownDiv =  await page.waitForSelector('._3cvRF2q > span > span'); //#classificationsPanel > 
	var dropLi = await page.$$('li[data-automation="item-depth-0"]');//'._3cvRF2q > span > span');

	//var jobCounts = await page.$$('._3v2SJ91 > span > span');
	for(var i = 0; i < dropLi.length; i++){ //cant loop from back, even though would be easier...because have to scrolll
		bigCategoryIndex = i;
		console.log('1');
		let category = await page.$$('._3cvRF2q > span > span');
		var categoryText = await category[i].getProperty('innerText');
		console.log('2');
		categoryText = await categoryText.jsonValue();
		page.waitFor(500);
		console.log("big category: " + categoryText);
		const bigCategory = categoryText;
		await page.waitForSelector('._3v2SJ91 > span > span');
		console.log('3');
		let jobCount = await page.$$('._3v2SJ91 > span > span');
		jobCount = await jobCount[i].getProperty('innerText');
		console.log('4');
		jobCount = await jobCount.jsonValue();
		console.log('jobs: ' + jobCount);
		const totalJobCount = jobCount;

		//sub-category tier jobs
		await category[i].click();
		await page.waitForSelector('li[data-automation="item-depth-1"]');//'._3cvRF2q > ul > li > ._3cvRF2q');
		
		const subCategories = await page.$$('li[data-automation="item-depth-1"]');
		console.log("subCategories.length: " + subCategories.length);
		const subCategoryData = [];

		//starting from 1 wil skip 'All' of category
		for(var z = 1; z < subCategories.length; z++){
			locations = {};
			//console.log('5');
			await page.waitForSelector('li[data-automation="item-depth-1"] > a > span');
			let subCategoryText = await page.$$('li[data-automation="item-depth-1"] > a > span'); //'._3cvRF2q > ul > li > ._3cvRF2q > span > span'
			subCategoryText = await subCategoryText[z].getProperty('innerText');
			subCategoryText = await subCategoryText.jsonValue();
			console.log("subcategory: " + subCategoryText);
			await page.waitForSelector('li[data-automation="item-depth-1"] > span > span');
			//console.log('6');
			let subJobCount = await page.$$('li[data-automation="item-depth-1"] > span > span');//'._3cvRF2q > ul > li > ._3cvRF2q > span:nth-child(2) > span'
			//console.log('7');
			subJobCount = await subJobCount[z].getProperty('innerText');
			subJobCount = await subJobCount.jsonValue();
			console.log("sub job: " + subJobCount); 

			//if is first category, will default to press this, otherwise press it
			if(z > 0) {
				const subCategories = await page.$$('li[data-automation="item-depth-1"]');
				//page.waitFor(1000);
				await subCategories[z].click();
				//page.waitFor(1000);
			}
			
			const pageData = await goToPage(page);
			var pays = main_helpers.calculateTotalAveragePay(pageData.salaries);
			console.log('moving on: ', pays);

			subCategoryData.push({
				subCategory: subCategoryText.replace(/\//g, '-'),
				subCategoryJobCount: subJobCount,
				salaries: pays, //average will be processed by helper method
				locations: pageData.locations
			});
			page.waitFor(1000);
			db_helper.writeSalaryLocationJobCountForSubcategory({
				pushId: pushId,
				bigCategory: bigCategory.replace(/\//g, '-'),
				subCategory: subCategoryText.replace(/\//g, '-'),
				salaries: pays,
				locations: pageData.locations,
				subCategoryJobCount: subJobCount
			}, address);
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
		db_helper.writeBigCategoryWithSmallCategories(data, address);
	}

	//close();
	return;
};	

async function goToPage(page){
	console.log("GO TO PAGE");
	const submitButton = await page.waitForSelector('button[type="submit"]');
	
	await submitButton.click();
	await page.waitFor(1500);
	await submitButton.click();

	//look at results page
	await page.waitForSelector('._1EkZJQ7');//'a[data-automation="jobTitle"]');
	
	// const jobArticles = await page.$$('._1EkZJQ7');
	// console.log('jobArticles: ', jobArticles.length);

	const data = await checkPageResults(page, 1, [], {});
	return { salaries: data.salaries, locations: data.locations };;
}

async function returnToPage(page, salaries, locations){
	console.log('RETURNING TO PAGE: ');
	await page.goto(urls.SEEK_NZ);

	const title = await page.title();
	console.log("title: " + title);

	const dropdown = await page.waitForSelector('#SearchBar__Classifications');

	await dropdown.click();

	const dropdownDiv =  await page.waitForSelector('._3cvRF2q > span > span'); //#classificationsPanel > 
	var dropLi = await page.$$('li[data-automation="item-depth-0"]');//'._3cvRF2q > span > span');


	//console.log('1');
	let category = await page.$$('._3cvRF2q > span > span');
	var categoryText = await category[bigCategoryIndex].getProperty('innerText');
	//console.log('2');
	categoryText = await categoryText.jsonValue();
	page.waitFor(500);
	console.log("big category: " + categoryText);
	const bigCategory = categoryText;
	await page.waitForSelector('._3v2SJ91 > span > span');
	//console.log('3');
	let jobCount = await page.$$('._3v2SJ91 > span > span');
	jobCount = await jobCount[bigCategoryIndex].getProperty('innerText');
	//console.log('4');
	jobCount = await jobCount.jsonValue();
	console.log('jobs: ' + jobCount);
	const totalJobCount = jobCount;

	//sub-category tier jobs
	await category[bigCategoryIndex].click();
	await page.waitForSelector('li[data-automation="item-depth-1"]');//'._3cvRF2q > ul > li > ._3cvRF2q');
	
	const subCategories = await page.$$('li[data-automation="item-depth-1"]');
	console.log("subCategories.length: " + subCategories.length);

	return { pays: salaries, locations: locations };
}

async function checkPageResults(page, pageNo, salaries, locations){
	console.log('CHECK PAGE RESULTS: ');
	await page.waitForSelector('a[data-automation="jobTitle"]');
	//console.log('1');
	currentPageUrl = await page.evaluate(() => window.location.href);
	//console.log('2');
	await page.waitForSelector('article[data-automation="normalJob"]');
	//console.log('3');
	//const jobResults = await page.$$('a[data-automation="jobTitle"]'); //._1EkZJQ7
	const jobResults = await page.$$('article[data-automation="normalJob"]');
	//console.log('jobresults.length: ', jobResults.length);
	var newSalaries = [];
	try{
		await page.waitForSelector('span[data-automation="jobSalary"] > span');
		//console.log('4');
		const jobSalaries = await page.$$('span[data-automation="jobSalary"] > span');
		//console.log('');
		for (var i = 0; i < jobSalaries.length; i++){
			var salary = await jobSalaries[i].getProperty('innerText'); //'innerText' //'textContent'
			salary = await salary.jsonValue();
			//console.log('salary: ', salary);
			newSalaries.push({
				'type': '',
				'value' : salary
			});
		}
		await page.waitForSelector('a[data-automation="jobLocation"]');
		const locationsList= await page.$$('a[data-automation="jobLocation"]'); //:nth-child(1)
		//console.log('location: ', locationsList);
		for ( var l = 0; l < locationsList.length; l++){
			var location = await locationsList[l].getProperty('innerText');
			location = await location.jsonValue();
			//console.log('location: ', location);
			if(isNaN(locations[location])){
				locations[location] = 0;
			}
			++locations[location];
			//console.log('locations: ', locations);
		}
	}catch(err){
		//console.log('err: ', err);
		//no salaries on the page, move on
		console.log("no salaries found");
	}
	//console.log('1');
	newSalaries = main_helpers.calculateAveragePay(newSalaries);
	//get all results of pay
	//put new salaries into old list
	newSalaries.forEach((newSalary) => {
		salaries.push(newSalary);
	});

	//console.log('2');
	await goNextPage(page, pageNo, salaries, locations);
	//console.log('3');

	return {salaries: salaries, locations: locations};
}

async function goNextPage(page, pageNo, salaries, locations){
	++pageNo;
	console.log('=> GOING TO NEXT PAGE => ', pageNo);
	
	try{	
		//wait for 'next' button to appear
		await page.waitForSelector('a[data-automation="page-next"]', { timeout: 5000 });
			//console.log('0.25');
		await page.goto(currentPageUrl + '?page=' + pageNo);
		//console.log('0.5');
		await page.waitFor(6500);
		//await page.waitForNavigation({waitUntil: "networkidle0"});
		//console.log('1');
		await page.waitForSelector('._1EkZJQ7');//'a[data-automation="jobTitle"]');
		//console.log('2');
		const jobArticles = await page.$$('._1EkZJQ7');

		//console.log('jobArticles: ', jobArticles.length);
		await checkPageResults(page, pageNo, salaries, locations);

		return { pays: salaries, locations: locations };
	}
	catch(err){
		console.log('err: ', err);
		console.log('NO MORE PAGES, EXITING: ');
		await returnToPage(page, salaries, locations);
		return { pays: salaries, locations: locations };
	}

}

//get the average pay for a career
async function getPay(page){
	await page.waitForSelector('.lwHBT6d');
	const pays = await page.$$eval('.lwHBT6d', e => e.innerHTML);
	console.dir('pay:', pays);
}

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