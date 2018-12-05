const urls = require('../constants').urls;
const elements = require('./elements');
const job_categories = require('../models/job_categories');
const main_helpers = require('../helpers/main_helpers');

exports.go = async function(page, close) {
	main_helpers.asyncForEach(job_categories, async (category) => {

		await page.goto(urls.SEEK + category + '-jobs'); //going directly from a URL is faster than typing and searching.

		const title = await page.title();
		console.log("title: " + title);

		await page.waitForSelector(elements.no_of_jobs);
		const textContent = await page.evaluate(e => {
			console.log("element: " + e);
			return document.querySelector( e ).textContent; 
		}, elements.no_of_jobs);

		//TODO save to firebase live DB - so results are reflected on clientside UI
		//date saved
		console.log( 'number of results = ' + textContent );

	});
	//close();
};	

;
