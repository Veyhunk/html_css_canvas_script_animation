	var waveHeight=0;
	var waveNum=61;
	function waves(){
			if (waveHeight<waveNum){
				$(".wave").css("height", waveHeight+"%");
				waveHeight++;
			}
			setTimeout(function() { waves() },15)	;
		}

	$(function(){
			$("#denfenjs").html(waveNum+"%");
			 waves();
		})