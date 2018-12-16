
//function that allows for execution of 'await' call within a forEach loop
exports.asyncForEach = async function(array, callback){
	for(let index = 0; index < array.length; ++index){
		await callback(array[index], index, array);
	}
}

exports.getArrayOfSelectOptions = async function(){
	
}

//dont need this for now...maybe after 5.
exports.getIframeFromUrl = async function(url){
	//await 
}

exports.calculateTotalAveragePay = function(salaries){
	var avgHourly = 0.0;
		hourlyCount = 0.0;
		avgAnnually = 0.0;
		annualCount = 0.0;

	salaries.forEach((salary) => {
		if(salary.type == 'hourly'){
			++hourlyCount;
			avgHourly += parseFloat(salary.value);
			console.log('averageHourly ', avgHourly, ' count: ', hourlyCount);
		}
		else if(salary.type == 'annual'){
			++annualCount;
			avgAnnually += parseFloat(salary.value);
			console.log('averageAnnual ', avgAnnually, ' count: ', annualCount);
		}
	});
	//console.log('avgHourly: ', avgHourly);
	//console.log('avgAnnually: ', avgAnnually);

	avgHourly = parseFloat(avgHourly) / parseFloat(hourlyCount);
	avgAnnually = avgAnnually / parseFloat(annualCount);
	//console.log('avgHourly: ', avgHourly);
	//console.log('avgAnnually: ', avgAnnually);
	avgHourly = avgHourly.toFixed(2);
	avgAnnually = avgAnnually.toFixed(2);

	if(isNaN(avgHourly)){
		avgHourly = 0;
	}
	if(isNaN(avgAnnually)){
		avgAnnually = 0;
	}
	return { 
		hourly: avgHourly,
		hourlyCount: hourlyCount,
		annually: avgAnnually,
		annualCount: annualCount
	};
}

exports.calculateAveragePay = function(salaries){
	return sanitizePayData(salaries); //averagePay
}

function sanitizePayData(salaries){
	console.log('salaries: \n', salaries);
	for(var i = 0; i < salaries.length; i++){
		//const regex = /[^a-zA-Z0-9+$]/gmi;
		//const regex = /[^\w]/gmi; //all non-word, non numeric characters
		const regexRemove = /[ $,+]/gmi; //replace these occurences with nothing
		const regexHourly = /\bperhour\b|\bp.h\b|\bph\b/gmi;
		const regexAnnually = /\bp.a\b/gmi; 
		//const regexK =  /[0-9]k/gi; //replace k with 000;
		const regexK = /[\d+]k/gi;
		const regexDay = /\bday\b|\bdaily\b/gmi;

		salaries[i].value = salaries[i].value.replace(regexK, (string) => {
			//console.log('k string: ', string);
			//console.log('k salaries[i]: ', salaries[i]);
			//get the first letter and add 000 instead of k.
			//console.log('returning k string: ', string.substring(0, 1) + '000');
			return string.substring(0, 1) + '000';
		});
		

		//classify into hourly or annual wage
		//get pay type and change array into object 
		if(regexDay.test(salaries[i].value)){
			//console.log('daily found: ', salaries[i].value);
			salaries[i].type = 'daily';
		}
		else if(regexHourly.test(salaries[i].value)){
			//console.log('hourly found', salaries[i].value);
			salaries[i].type = 'hourly';
		} else if(regexAnnually.test(salaries[i].value)){
			//console.log('annual found', salaries[i].value);
			salaries[i].type = 'annual';
		} else {
			//check if value is above minimum annual wage
			//filter whole numbers //.replace(/[.]/g, '')
			var numbers = salaries[i].value.match(/\d+/g);
			if(numbers != null && numbers.length > 0){
				//check if either of them is larger than minimum wage
				if(numbers[0] > 30000 || numbers[1] > 30000){
					salaries[i].type = 'annual';
				} else {
					salaries[i].type = 'hourly';
				}
			}
		}
		//revmoe specific characters
		salaries[i].value = salaries[i].value.replace(regexRemove, '');	
		//get rid of 8% holiday pay
		salaries[i].value = salaries[i].value.replace(/[0-9]%/g, '');
		//get rid of dots followed by characters
		salaries[i].value = salaries[i].value.replace(/[a-z]\./gi, '');
		//change 'to' to hyphen for comparison
		salaries[i].value = salaries[i].value.replace('to', '-');
		//get rid of alphanumersic that are not in '-', '.', '%'
		//salaries[i].value = salaries[i].value.replace(/[^0-9\-.%]/gi, '');
		salaries[i].value = salaries[i].value.replace(/[^\d+\-.%]/gi, '');
		//get the average
		//find '-'
		//if the difference between two numbers is more than 1000, 
		
		const index = salaries[i].value.indexOf('-');
		if(index >= 0){
			var val1 = salaries[i].value.substring(0, index);
			var val2 = salaries[i].value.substring(index + 1, salaries[i].value.length);
			//console.log('val1: ', val1, ' val2: ', val2);
			//when 'to' was converted to hyphen, one of the numbers becomes NaN.
			if(isNaN(val1)){
				salaries[i].value = parseFloat(val2);
			}
			else if(isNaN(val2)){
				salaries[i].value = parseFloat(val1);
			}
			else {
				//if one value is more than 30,000 and the other is less than 1000, then it means k hasn't been added, so add it on to the other one.
				//e.g. 160 - 200K = 160 and 200,000, but it should be 160,000 and 200,000
				if(parseFloat(val1) > 30000 && parseFloat(val2) < 1000){
					val2 = val2 + '000';
					console.log('fixing floats: ', val2);
				}
				else if(parseFloat(val2) > 3000 && parseFloat(val1) < 1000){
					val1 = val1 + '000';
					console.log('fixing floats: ', val1);
				}
				salaries[i].value = +((parseFloat(val1) + parseFloat(val2)) / 2.0).toFixed(2); //+will shave off extra zeros
			}
		}

		//check which ones are not being defined again
		if(salaries[i].type == ''){
			//console.log('double checking: ', salaries[i]);
			if(parseFloat(salaries[i].value) > 30000){
				salaries[i].type = 'annual';
			}
			else {
				salaries[i].type ='hourly';
			}
		}
		// if(salaries[i].value == ''){
		// 	//console.log("splicing4: ", salaries[i]);
		// 	salaries.splice(i, 1);
		// }
		//if type is annual and salary is less than 1000, add '000'
		//this is due to recruiters entering information as $70.00 - $80.00 p.a.
		//without 'k' symbol
		if(salaries[i].type == 'annual' && parseFloat(salaries[i].value) < 1000){
			console.log('fixing small annual: ', salaries[i]);
			salaries[i].value = salaries[i].value + '000'; 
		}
		else if(salaries[i].type == 'hourly' && parseFloat(salaries[i].value) > 1000){
			console.log('fixing large hourly: ', salaries[i]);
			salaries[i].type = 'annual';
		}
			//continue modifying strings
		//get rid of blank entries 
		if(salaries[i].value == '' || isNaN(salaries[i].value)){
			//console.log("splicing1: ", salaries[i]);
			salaries.splice(i, 1);
		}
		else if(salaries[i].type == ''){
			//console.log("splicing2: ", salaries[i]);
			salaries.splice(i, 1);
		}
		//get rid of phone numbers
		else {
			try{
				if(typeof salaries[i].value != 'string'){
					//if(salaries[i].value.match(/[ ]\d+/gi) >= 0){
						if(salaries[i].value.match(/[ ]0/gi) >= 0){
						//console.log("splicing3: ", salaries[i]);
						salaries.splice(i, 1);
					}
				}
			}catch(err){
				//error caught because value is not a string
			}
		}
	}
	console.log('salaries for average: \n', salaries);

	salaries.forEach(salary => {
		
	});

	return salaries;
}