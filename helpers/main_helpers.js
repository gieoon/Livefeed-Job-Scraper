
//function that allows for execution of 'await' call within a forEach loop
exports.asyncForEach = async function(array, callback){
	for(let index = 0; index < array.length; ++index){
		await callback(array[index], index, array);
	}
}

exports.getArrayOfSelectOptions = async function(){
	
}
