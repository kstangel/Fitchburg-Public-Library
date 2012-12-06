var display_count = 25;
var display_time = 10000;
var data = new Array();
var visibleIndex = -1;
var $ls;

$(function(){
	var columns = new Array('firstname','lastname','type','pledge','collectiondevelopment','inkind','technology','specialcollections','comments');
	var categories = new Array(999,9999,34999,99999,300000,1000000);
	var url = 'https://spreadsheets.google.com/feeds/list/0AiIFK3GjZaf1dEY2R3dna1ZCdHctREFrbGRscW9MTEE/od7/public/basic?hl=en_US&&alt=json-in-script&callback=?';
	var $_GET = {};
	$ls = $('ul#list');
	document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
	    function decode(s) {
		return decodeURIComponent(s.split("+").join(" "));
	    }
	    $_GET[decode(arguments[1])] = decode(arguments[2]);
	});
	/*$('#back a').click(function(){
		history.go(-1);
		return false;
	});*/	
	if($_GET['title']){	
		$('#title h1').text(unescape($_GET['title']));
		delete $_GET['title'];
	}	
	if($_GET['subtitle']){	
		$('#title h2').text(unescape($_GET['subtitle']));
		delete $_GET['subtitle'];
	}
	$.getJSON(url,function(json){
		var donor = json.feed.entry;
		var $ds = $('<ul></ul>').appendTo('#data');
		var col_end = new RegExp("\\\, ("+columns.toString().replace(/\,/g,'|')+")\\\: ");
		categories = categories.reverse();
		$.each(donor,function(i,v){
			var raw = v.content.$t;
			var attr = '';
			for(c in columns){
				var col = columns[c];
				var col_start = col+': ';
				var ci = raw.indexOf(col_start);
				if(ci >= 0) {
					var data = raw.substring(ci+col_start.length);
					var endi = data.search(col_end);
					if(endi > 0) data = data.substring(0,endi);
					if(col == 'pledge'){
						var cat = categories[0];
						var pledge = parseInt(data.replace(/[^0-9]/g,''));
						var prevCat = 0;
						for(cati in categories){	
							if(pledge <= categories[cati]) 
								cat = categories[cati];
						}
						attr += ' data-category="'+cat+'"';
						attr += ' data-pledge="'+pledge+'"';
					}else{
						attr += ' data-'+col+'="'+escape(data)+'"';
					}
				}
			}		
			$ds.append('<li'+attr+'><h3>'+v.title.$t+'</h3><p>'+raw+'</p></li>');
		});
		$ls.html('');
		$ls.removeClass('loading');
		
		for(col in $_GET){	
			if(col == 'all'){
				var selector = 'li';
				$('#back').addClass('hidden');
			}else { 
				var val = $_GET[col];
				if(val) var selector = 'li[data-'+col+'="'+escape(unescape(val))+'"]';
				else var selector = 'li[data-'+col+']';
			}
			$currentData = $(selector,$ds);
			if($currentData.length){
				var j = display_count;
				$currentData.each(function(i){
					if(j == display_count){
						data.push($('<ul></ul>'));
						visibleIndex++;
						j = 0;	
					}else j++;
					$x = $(this);	
					var details = new Array();
					var pledge = $x.attr('data-pledge');
					var special = $x.attr('data-specialcollections');
					var tech = $x.attr('data-technology');
					var inkind = $x.attr('data-inkind');
					var comments = $x.attr('data-comments');
					//if(pledge) details.push(' '+formatCurrency(pledge));
					if(col == 'specialcollections'){
						if(special) details.push(' '+unescape(special));
					}else if(col == 'inkind'){
						if(inkind) details.push(' '+unescape(inkind));
					}else if(col == 'technology'){
						if(tech) details.push(' '+unescape(tech));
					}else{
						if(special) details.push(' Special Collections: '+unescape(special));
						if(tech) details.push(' '+unescape(tech));
						if(inkind && inkind != tech) details.push(' '+unescape(inkind));
					}
					if(comments) details.push(' '+unescape(comments).replace('comments: ',''));		
					data[visibleIndex].append("<li><h3>"+$('h3',$x).text()+"</h3><p>"+details.toString().replace(/ /,'')+"</p></li>");	
				});
				visibleIndex = Math.floor(Math.random()*data.length);
				updateList();
			}else{
				$ls.append('<li>No donors currently in this category</li>');
			}
		}	
	});
	function formatCurrency(num) {
	num = num.toString().replace(/\$|\,/g,'');
	if(isNaN(num))
	num = "0";
	sign = (num == (num = Math.abs(num)));
	num = Math.floor(num*100+0.50000000001);
	num = Math.floor(num/100).toString();
	for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
	num = num.substring(0,num.length-(4*i+3))+','+
	num.substring(num.length-(4*i+3));
	return (((sign)?'':'-') + '$' + num);
	}	
});
function updateList(){
	$ls.fadeOut('slow', function() {
		visibleIndex++;
		if(visibleIndex >= data.length) visibleIndex = 0;
		$ls.html(data[visibleIndex].html());
		$ls.fadeIn('slow', function(){
			if(data.length > 1) setTimeout('updateList()',display_time);
		});
	});	
}
