const constants = require('../constants');
const urls = constants.urls;
const main_helpers = require('../helpers/main_helpers');
//const db_helper = require('./controller');
const global_db_helper = require('../global_controller');
const address = constants.collections.INDEED;

exports.go = async function(page, close){

	const pushId = Date.now().toString();

	await page.goto(urls.INDEED);

	const title = await page.title();
	console.log("title: " + title);

	const allSearchTerms = await global_db_helper.getAllSearchTerms();
	//console.dir(allSearchTerms);
	for(var i = 0; i < allSearchTerms.length; i++){

		var category = allSearchTerms[i].category;
		console.log("bigCategory: " + category);
		const totalJobCount = await search(page, category);

		const subcategories = allSearchTerms[i].subcategory.subcategories;
		//console.dir(subcategories)
		const subcategoriesData = [];
		for(var z = 0; z < subcategories.length; z++){
			//const input = await page.waitForSelector('input#what');
			var subcategory = subcategories[z];
			console.log("subCategory: " + subcategory);
			const jobCount = await search(page, subcategory);
			subcategoriesData.push({
				subCategory: subcategory,
				subCategoryJobCount: jobCount
			});
		}
		console.log('-------------------------------------------');
		console.log("WRITING TO DB");
		global_db_helper.writeBigCategoryWithSmallCategories({
			pushId, pushId,
			bigCategory: category,
			totalJobCount: totalJobCount,
			subCategories: subcategoriesData
		}, address);
		console.log("WRITING TO DB COMPLETED SUCCESSFULLY");
	}
	return;
}

async function search(page, searchTerm){
	const input = await page.waitForSelector('input#what');
	// await page.$eval('input#what', e => {
	// 	e.value = ''	
	// });
	//await page.waitFor(1000);
	//await page.focus('input#what');
	//holy crap that works THE BEST!!! better than clearing the value and then waiting!!!!
	await input.click({ clickCount: 3 }); //selects all text
	await page.type('input#what', searchTerm);
	//TODO verify the search term is the same, otherwise repeat, ad div may have popped up

	console.log("waiting click");
	await page.click('input#fj');
	 console.log("waiting network");
	// //await page.waitFor(500);
	try{
		await page.waitForNavigation({waitUntil: "networkidle0"});
	}
	catch(err){
		console.log("caught network error, trying again");
		//search(page, searchTerm);
		await page.click('input#fj');
		await page.waitFor(5000);
	}

	//check if search was successful
	// await page.waitFor(() =>
	// 	document.querySelectorAll('div#searchCount', 'div#suggested_queries').length
	// );

	 console.log("1");
	try{
		await page.waitForSelector('div#searchCount', { timeout: 5000 });
		console.log('2');
		let jobCount = await page.$eval('div#searchCount', e =>  e.innerHTML);
		console.log('3');
		var index = jobCount.search('of ') + 2; //filter out 'of '' 
		jobCount = jobCount.substring(index, jobCount.length - 5); //cut out ' jobs'
		jobCount = jobCount.replace(/ /g, '');
		console.log('jobCount: ' + jobCount);
		// //await page.waitFor(500);
		return jobCount;
	} 
	//const tryAgain = await page.waitForSelector('div#suggested_queries', {timeout: 10});
	//results dont exist
	catch(err){
		console.log("0");
		return 0;
	}
}