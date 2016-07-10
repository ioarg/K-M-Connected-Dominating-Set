/*
This file will be used to alter the view of the page 
*/

$(document).ready(function() {
	
	//Paint Wu & Lee's step dominators ========================================
	function paintWuLeeDominators(){
		var tempNode;
		
		//paint every node with the initial color
		for(var j=0; j<network.nodes.length; j++){
			network.nodes[j].graphic.attr({ circle: {fill: DEFAULTFILL}});
		}

		if(dominatorListWL.length > 0){
			
			for(var i=0; i< dominatorListWL.length; i++){
				tempNode = returnNodeById(dominatorListWL[i]);
				tempNode.graphic.attr({ circle: {fill: DOMINATORFILL}});
				
			}
		}
	}



	//Buttons ==================================================================================
	$("#results_btn").click(function(event) {
		$(".btn").removeClass("btn_clicked");
		$("#results_btn").addClass("btn_clicked");
		finalResultsStringWL = "<p>Initially we use the Wu && Li algorithm to get a minimum CDS </p>";
		calculateWuLi();
		paintWuLeeDominators();
		$("#final_results").html(finalResultsStringWL);
		$("#final_results").toggle(200);
	});

	$("#final_results").hide();

});