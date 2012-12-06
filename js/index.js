var display_count = 20;
var display_time = 5000;
var data = new Array();
var visibleIndex = -1;
var $ls;
$(function(){
	var activeID = getCookie('active_menu');
	if(!activeID) activeID = 'spc';
	loadMenu(activeID);
	$('#submenu').removeClass('hidden');
	var url = 'https://spreadsheets.google.com/feeds/list/0AiIFK3GjZaf1dEY2R3dna1ZCdHctREFrbGRscW9MTEE/od7/public/basic?hl=en_US&&alt=json-in-script&callback=?';
	$ls = $('<ul></ul>').appendTo('#left');
	$.getJSON(url,function(json){
		var donor = json.feed.entry;
		var $ds = $('<ul></ul>').appendTo('#data');
		var j = display_count;
		$.each(donor,function(i,v){
			if(j == display_count){
				data.push($('<ul></ul>'));
				visibleIndex++;
				j = 0;	
			}else j++;
			$ds.append('<li><h3>'+v.title.$t+'</h3><p>'+v.content.$t+'</p></li>');
			data[visibleIndex].append('<li>'+v.title.$t+'</li>');	
		});
		visibleIndex = Math.floor(Math.random()*data.length);
		updateList();	
	});
	$('#menu a').click(function(e){
		loadMenu($(e.target).parent().attr('id'));
	});
	function loadMenu(id){
		var $a = $('#'+id);
		var $link = $a.children('a');
		if(!$a.hasClass('selected') && $link.attr('href') == '#'){ 
			setCookie('active_menu',id,1);
			$('#menu .selected').removeClass('selected');
			$a.addClass('selected');
			var $b = $('#submenu');
			$('h2',$b).text($link.text());
			$('ul',$b).html($('ul',$a).html());   
		}

	}
	function setCookie(name,value,days) {
	    if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	    }
	    else var expires = "";
	    document.cookie = name+"="+value+expires+"; path=/";
	}
	function getCookie(name) {
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	    return null;
	}
	function deleteCookie(name) {
	    setCookie(name,"",-1);
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
