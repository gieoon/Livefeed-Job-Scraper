
exports.writeBigCategoryWithSmallCategories = function(data){
	const db = require('../DB/firestore');
	const address = require('../constants').collections.INDEED;
	var bigRef = db.collection(address)
				.doc(data.pushId)
				.collection(data.category);

	bigRef.doc('CATEGORY TOTAL').set({
		totalJobCount: data.totalJobCount
	});

	//save sub-categories
	for(var i = 0; i < data.subCategories.length; i++){
		bigRef.doc(data.subCategories[i].subCategory)
			  .set({
		  		jobCount: data.subCategories[i].jobCount
			});
	}
}



