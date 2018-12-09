
//show the number of queries you need with this.

//writes the number of students in each year 
exports.writeStudentsInYear = function(data){
	const db = require('../DB/firestore');
	const address = require('../constants').collections.UOA;
	var ref = db.collection(address)
				.doc(data.pushId) //unique timestamp for document
				.collection(data.year) //collections separated by year
				.doc(data.qualification); //year separated by qualification

	ref.set({
		noOfGrads: data.noOfGrads
	});
} 



