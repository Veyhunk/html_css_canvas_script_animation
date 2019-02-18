$(function(){
	/*IP统计*/
	url="http://www.100sucai.com/phpajax/ajax_ip.php?abc=www.100sucai.com";
	$.ajax({url:url,async:false});
	
	/*浏览量统计*/
	var aid=$("#aid").val()
	urls="http://www.100sucai.com/phpajax/ajax_view.php?abc=www.100sucai.com&id="+aid;
	$.ajax({url:urls,async:false});  

	var time=30
	setInterval(function(){
		if(time>0){
			time--
			$("#time").html(time);
		}else{
			time=30
			$("#time").html(time);
			fn();
		}
		
	},1000)

	fn();
	function fn(){
		/*浏览量统计*/

		$.ajax({
	         type: "GET",
	         url: "../../../phpajax/view.php",
	         dataType: "json",
	         success: function(data){
	         	$("#pv").html(data.pv);
	         	$("#ip").html(data.ip);
	         	$("#download").html(data.download);
	         }

	     });
	}
})
