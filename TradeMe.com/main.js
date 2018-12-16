const constants = require('../constants');
const urls = constants.urls;
//const db_helper = require('./controller');
const global_db_helper = require('../global_controller');
const address = constants.collections.TRADEME;

exports.go = async function(page, close){

	const pushId = Date.now().toString();

	await page.goto(urls.TRADEME);

	const title = await page.title();
	console.log("title: " + title);
	const allSearchTerms = await global_db_helper.getAllSearchTerms();

	for(var i = 0; i < allSearchTerms.length; i++){
		var category = allSearchTerms[i].category;

		const totalJobCount = await search(page, category);
		const subcategories = allSearchTerms[i].subcategory.subcategories;
		const subcategoriesData = [];
		for(var z = 0; z < subcategories.length; z++){
			var subcategory = subcategories[z];
			console.log('subcategory: ' + subcategory);
			const jobCount = await search(page, subcategory);
			subcategoriesData.push({
				subCategory: subcategory,
				subCategoryJobCount: jobCount
			});
		}
		console.log('-------------------------------------------');
		console.log("WRITING TO DB");
		global_db_helper.writeBigCategoryWithSmallCategories({
			pushId: pushId,
			bigCategory: category,
			totalJobCount: totalJobCount,
			subCategories: subcategoriesData
		}, address);
		console.log("WRITING TO DB COMPLETED SUCCESSFULLY");

	}
	return;
}

async function search(page, searchTerm){
	const input = await page.waitForSelector('input#searchString');
	await input.click({ clickCount: 3 });
	await page.type('input#searchString', searchTerm);

	console.log('1');
	await page.click('button[type="submit"]');
	console.log('2');
	try{
		//await page.waitForNavigation({ waitUntil: "networkidle0"});
		await page.waitFor(1000);
	}
	catch(err){
		console.log('network error waiting to repeat');
		await page.click('button[type="submit"]');
		await page.waitFor(5000);
	}


	try{
		await page.waitForSelector('#ListView_listingTableHeader_headerColumnListViewText');
		console.log('3');
		let jobCount = await page.$eval('#ListView_listingTableHeader_headerColumnListViewText', e => e.innerHTML);
		console.log('4');
		var index = jobCount.search('listings') - 1;
		jobCount = jobCount.substring(0, index);
		jobCount = jobCount.replace(/ /g, '');
		console.log('jobCount: ', jobCount);
		return jobCount;
	} 
	catch(err){
		console.log('0');
		return 0;
	}
}