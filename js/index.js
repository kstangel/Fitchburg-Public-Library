//var url = 'https://spreadsheets.google.com/feeds/list/0AiIFK3GjZaf1dEY2R3dna1ZCdHctREFrbGRscW9MTEE/od7/public/basic?hl=en_US&&alt=json-in-script&callback=?'; //Original Donors Spreadsheet
var DONOR_URL = 'https://spreadsheets.google.com/feeds/list/0AiIFK3GjZaf1dDdsQ3EyNG9PWEV0LVBONzF1MGY0ZlE/od7/public/basic?hl=en_US&&alt=json-in-script&callback=?'; //Testing Donors Spreadsheet
var CATEGORIES_URL = "https://spreadsheets.google.com/feeds/cells/0AiIFK3GjZaf1dDdsQ3EyNG9PWEV0LVBONzF1MGY0ZlE/2/public/basic?alt=json-in-script&callback=?";
var RESOURCES_URL = "https://spreadsheets.google.com/feeds/cells/0AiIFK3GjZaf1dDdsQ3EyNG9PWEV0LVBONzF1MGY0ZlE/3/public/basic?alt=json-in-script&callback=?";
var SCROLL = 704;
var MAX_NUM_CAT = 7;

var display_count = 20;
var display_time = 5000;
var data = new Array();
var visibleIndex = -1;
var $ls;
var categories = [];
var resources = [];


$(function(){
	var $menu = $('#menu');
	var $hiddenMenuItems = $menu.find("li.hidden > a");
	var $nextBtn = $('#next');
	var $prevBtn = $('#prev');
	var $list = $('#menu li');
	var $externalBtn = $('#external-btn');
	var $externalContainer = $('#external-container');
	var $externalClose = $('#external-close');
	var $externalList = $externalContainer.find('ul');
	var $popups = $('#popup-container');
	var $popupBg = $('#popup-bg');
	var $popupClose = $('#popup-close');

	if ($list.length > MAX_NUM_CAT) $nextBtn.show();

	fetchSheet(CATEGORIES_URL,categories,function(){
		categories.forEach(function(c,i){
			var topLevelLink = c.secondlevelcategory ? '#' : 'list.html?donorcategories='+encodeURIComponent(c.toplevelcategory);
			var $subCategory = $("<li id='"+getId(c.toplevelcategory)+"'><a href='"+topLevelLink+"'>"+c.toplevelcategory+"</a><ul class='second-menu'></ul></li>");
			$menu.append($subCategory);
			if (c.secondlevelcategory){
				c.secondlevelcategory.split(',').forEach(function(s,j){
					var existingLinks = false;
					$hiddenMenuItems.each(function(){
						if ( $(this).text() == s ){
							existingLinks = true;
							$subCategory.find('.second-menu').append($(this).parent());
							$subCategory.find('.second-menu li').removeClass('hidden');
						}
					});
					if(!existingLinks){
						$subCategory.find('.second-menu').append("<li><a href='list.html?donorcategories="+encodeURIComponent(s)+"'>"+s+"</a></li>");
					}
				});
			}
		});
		var activeID = getCookie('active_menu');
		if(!activeID) activeID = $menu.find('li').first().attr('id');
		loadMenu(activeID);
		$('#submenu').removeClass('hidden');
		$('a:not(.action)').click(function(e){
			loadMenu($(e.target).parent().attr('id'));
		});
 	});

	fetchSheet(RESOURCES_URL,resources,function(){
		resources.forEach(function(r,i){
			if(r.title && r.title.length != 0 && r.url ) {
            r.url = r.url && r.url.indexOf("http://") == -1 ? "http://"+r.url : r.url;

				$externalList.append("<li><a id='popup-"+i+"' class='action external' href='#'>"+r.title+"</a></li>");
				$popups.append("<iframe class='popup-"+i+"' sandbox='allow-same-origin allow-scripts allow-popups allow-forms' src='"+r.url+"'></iframe>");
				$('#popup-'+i).click(function(){
					$popups.find('h2').text($(this).text());
					$popupBg.show();
					$popups.show();
					$('iframe.active').removeClass('active');
					$("iframe."+this.id).addClass('active');
				});
			}
		});
	});

	//I left this in from the original...could have used fetchSheet but if it's not broke don't fix it.
	$ls = $('<ul></ul>').appendTo('#left');
	$.getJSON(DONOR_URL,function(json){
		var donor = json.feed.entry;
		var $ds = $('<ul></ul>').appendTo('#data');
		var j = display_count;
		var uniqueDonors = [];
		$.each(donor,function(i,v){
			if (v.title.$t.toLowerCase().indexOf('anonymous') == -1 && $.inArray(v.title.$t.toLowerCase(),uniqueDonors) == -1){
				uniqueDonors.push(v.title.$t.toLowerCase());
				if(j == display_count){
					data.push($('<ul></ul>'));
					visibleIndex++;
					j = 0;
				}else j++;

				$ds.append('<li><h3>'+v.title.$t+'</h3><p>'+v.content.$t+'</p></li>');
				data[visibleIndex].append('<li>'+v.title.$t+'</li>');
			}
		});
		visibleIndex = Math.floor(Math.random()*data.length);
		updateList();
	});

	$nextBtn.click(function(){
		var scroll = $menu.scrollTop() + SCROLL;
		if(scroll >= $menu.height()) $nextBtn.hide();
		if(scroll > 0) $prevBtn.show();
		$menu.animate({scrollTop:scroll},750);
	});

	$prevBtn.click(function(){
		var scroll  = $menu.scrollTop() % SCROLL == 0 ? $menu.scrollTop() - SCROLL : $menu.scrollTop() - ($menu.scrollTop() % SCROLL)
		if(scroll <= 0) $prevBtn.hide();
		if(scroll < $menu.height()) $nextBtn.show();
		$menu.animate({scrollTop:scroll},750);
	});

	$externalBtn.click(function(){
		$(this).animate({top:"-55px"},120);
		$externalContainer.delay(300).animate({top:"0px"},200);
	});

	$externalClose.click(function(){
		var height = $externalContainer.outerHeight() + 2;
		$externalContainer.animate({top:"-"+height+"px"},200);
		$externalBtn.delay(300).animate({top:"0px"},120);
	});

	$popupClose.click(function(){
		$popupBg.hide();
		$popups.hide();
		$('iframe.active').removeClass('active');
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
			$b.find('a').click(function(e){
				loadMenu($(e.target).parent().attr('id'));
			});
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
