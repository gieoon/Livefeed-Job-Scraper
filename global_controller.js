
//for intializing the categories array
exports.writeCategoriesFromSeekData = function(){
	const db = require('./DB/firestore');
	const addresses = require('./constants').collections;
	console.log("Loading new DB Search terms from SEEK categories data...");
	console.log("----------------------------------");
	var categories = [];
	categoriesRef = db.collection(addresses.CATEGORIES);
	//var promises = [];
	var categoryRef = db.collection(addresses.SEEK).doc('1544103339123');
	//get all collections within document
	//promises.push(
		categoryRef.getCollections().then(collections => {
			collections.forEach(collection => {
				//console.log(collection.id);
				//get all documents within collection
				collection.get().then(snapshot => {
					snapshot.forEach(doc => {
						//console.log(doc.id, '=>', doc.data());
						if(doc.id !== 'CATEGORY TOTAL'){
							//console.log(doc.id);
							categories.push(doc.id);
						}
						if(doc.id == 'Speech Therapy'){
							console.log("Finished loading successfully: " + categories.length);
							//categoriesRef.set({ 'categories': categories });
						}
					});
					categories = sanitizeCategories(categories);
					categoriesRef.doc(collection.id).set({
						'subcategories': categories 
					});
					categories = [];
					console.log("----------------------------------");
					console.log("Finished Loading Successfully");

				}).catch(err => {
					console.log('error getting subcategory documents', err);
				}).then(()=> {
					
				});
				categories.push(collection.id);
			});
		})
	//);

	// Promise.all(promises)
	// 	.then(() => {

	// 	})
}

function sanitizeCategories(categories){
	//remove '&' and split into two strings
	for(var i = categories.length - 1; i >=0; i--){
		// if(categories[i].indexOf('&') > 0){
		// 	//split the string at index
		// 	var index = categories[i].indexOf('&');
		// 	var tempStr = categories[i].substring(0, index - 1);
		// 	//add new value to array
		// 	categories.push(categories[i].substring(index + 1, categories[i].length));
		// 	categories[i] = tempStr;
		// }
		if(categories[i].indexOf('All ') > 0){
			var index = categoeires[i].indexOf('All ');
			var tempStr = categories[i].substring(index + 4, categories[i].length);
			categories[i] = tempStr;
		}
		//remove hyphens
		categories[i] = categories[i].replace(/-/g, ' ');
		categories[i] = categories[i].replace(',', '');
		categories[i] = categories[i].replace('&', '');
		console.log(categories[i]);
	}


	return categories;
}


exports.getAllSearchTerms = async function(){
	const db = require('./DB/firestore');
	const addresses = require('./constants').collections;
	const categories = [];

	let categoryCollection = db.collection(addresses.CATEGORIES);
	let categoriesRef = await categoryCollection.get();
	for(doc of categoriesRef.docs){ //for..of will allow for waiting for asynchronous to finish.
		//console.log("writing category");
		categories.push({
			category: doc.id,
			subcategory: doc.data()
		});
	}
	console.log("------------------------------------------");
	console.log("FINISHED READING FROM DB");
	console.log("------------------------------------------");
	
	return categories;

}

	//or define promise directly here and use promise.then()
		// db.collection(addresses.CATEGORIES)
		// 	.get()
		// 	.then(snapshot => {
		// 		snapshot.map(async doc => {
		// 			categories.push({
		// 				category: doc.id, a
		// 				subcategory: doc.data()});
		// 		});
		// 		console.log("returning");
		// 		return categories;
		// 	});


