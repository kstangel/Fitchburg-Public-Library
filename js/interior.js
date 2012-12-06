var img_speed = 3000;
var $current_img;
var playForward = false;
$(function(){
	/*$('#back a').click(function(){
		history.go(-1);
		return false;
	});*/
	var $imgSet = $('#right img');
	$current_img = $('#right img:last-child');
	if($imgSet.length > 1){
		setTimeout("slideSwitch()",img_speed);
	}
});
function slideSwitch(){
	if(playForward){
		var $next = $current_img.next();
		if($next.length){
			$next.fadeIn('slow');
			$current_img = $next;
			setTimeout("slideSwitch()",img_speed);
		}else{
			playForward = false;
			slideSwitch();
		}
	}else{
		var $next = $current_img.prev();
		if($next.length){
			$current_img.fadeOut('slow');
			$current_img = $next;
			setTimeout("slideSwitch()",img_speed);
		}else{
			playForward = true;
			slideSwitch();
		} 
	}	
}
