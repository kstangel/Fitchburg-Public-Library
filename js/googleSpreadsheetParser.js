//read Google Sheet data into an array
function fetchSheet(url,array,callback){
	$.getJSON(url,function(json){
		parseJSON(json,array);
		if(typeof(callback) == "function") callback();
	});
}

//parse cell data into array
function parseJSON(json,array){
	var data = getCellData(json.feed.entry);
	//parse into useable structure
	var columns = data[0]; //first row contains labels
	for(var row = 1; row < data.length; row++){
		var i = row-1;
		if(!array[i]) array[i] = {};
		for(var col = 0; col < columns.length; col++){
			var label = columns[col].toLowerCase().replace(/\W/g,'');
			var value = data[row][col];
			if(value) array[i][label] = value;
		}
		if(!Object.keys(array[i]).length) array.pop(i);
	}
}

//returns data[row][column] from Google JSON cell format
function getCellData(cells){
	var data = [];
	cells.forEach(function(e){
		var location = e.id.$t.split('/');
		location = (location[location.length-1].split('R')[1]).split('C');
		var row = parseInt(location[0])-1;
		var column = parseInt(location[1])-1;
		if(!data[row]) data[row] = [];
		data[row][column] = e.content.$t;
	});
	return data;
}

function getId(text){
	return text.replace(/\W/g, '').toLowerCase();
}
