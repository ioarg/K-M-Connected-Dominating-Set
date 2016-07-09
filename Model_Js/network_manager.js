$(document).ready(function(){

	//Network Structure ==========================================

	//Node class
	//the graphic is used for rendering a node graphics shape
	var Node = function (id_in, neighbors, graphic){

		this.id = id_in;
		this.neighbors = neighbors;
		this.graphic = graphic;
	}

	//The network class => an array of nodes

	var Network = function (){
		this.nodes = [];
	} 

	// Initialization Globals =========================

	var network = new Network(); 						//The Network object that holds all the network information
	var usedIds = []; 									//A list of the used node ids so far
	var panelOffset = $("#graph_panel").offset();		//The offset of the panel from the document, for mouse events
	var addingNode = false; 							//If the add node button is active
	var removingNode = false;							//If the remoce node button is active
	var linkSelect1 = false;							//I'm in 'select first node' functionality while drawing a link (edge)
	var linkSelect2 = false;							//I'm in 'select second node' functionality while drawing a link
	var linkStart;										//Start node of the link
	var linkEnd; 										//End node of the link


	//Graphics Management (with Joint Js) ==============================================================

	//the main graph object
	var graph = new joint.dia.Graph;

	//the main view panel 
    var paper = new joint.dia.Paper({
        el: $('#graph_panel'),
        width: 800,
        height: 700,
        model: graph,
        gridSize: 1
    });

    //Click on blank space of view callback (used for adding nodes to the point clicked)
    paper.on('blank:pointerclick',function(event){

    	//if adding a node is enabled
    	if (addingNode){

    		var newID;

	  		/*
	  		We set the new node's id.
	  		If a node was removed, then we use a sorted list
	  		of used ids to find the one missing and assign it
	  		to the new node
	  		*/
	    	if(usedIds.length == 0){
	    		newID = 1;
	    		usedIds.push(newID);
	    	}
	    	else if(usedIds.length == 1){
	    		newID = 2;
	    		usedIds.push(newID);
	    	}
	    	else{
	    		for(var i=1; i < usedIds.length; i++){
	    			if( (usedIds[i] - usedIds[i-1]) == 1 ){
	    				newID = usedIds[i] + 1;
	    			}
	    			else{
	    				newID = i+1;
	    				break;
	    			}
	    		}
	    		usedIds.push(newID);
	    	}
	    	usedIds.sort();
	    	console.log(usedIds);

	  		//create the graphics shape at the position clicked
	    	var circleShape = new joint.shapes.basic.Circle({
	    		position: { x: event.pageX - panelOffset.left - 20, y: event.pageY - panelOffset.top - 20},
	    		size:{ width:35, height:35},
	    		attrs:{ circle: {fill: '#cccc00'}, text: { text : newID, fill : 'white'}},
	    		prop:{ node_id : newID}
	    	});

	    	//stop adding/removing nodes if you moved one
	    	circleShape.on("change:position",function(){
	   			stopFunctionality("all");
	    	});

	    	//add the new shape to the graph
	    	graph.addCell(circleShape);

	    	//create the node in the network
	    	var node = new Node( newID, [], circleShape);
	    	network.nodes.push(node);

	    	console.log(network);
	    }

    });

    //Click on a node callbacks
    paper.on('cell:pointerclick', function(cellView, evt, x, y) { 

    	//if we are removing nodes ======
		if (removingNode){
			//get the id of the node
			var shape_id = cellView.model.attributes.prop["node_id"];
			console.log("removing the node ======================>", shape_id);
			var neighbor_id;
			var neighborhood = returnNodeById(shape_id).neighbors;
			var neighbor;
			console.log("i will check this neighborhood", neighborhood);
			//update neighborhood of removed node and its neighbors'
			if(neighborhood.length > 0){
				//for each of his neighbors, get their id
				for(var j=0; j<neighborhood.length; j++){
					neighbor_id = neighborhood[j];
					console.log("checking neihbor : ",neighbor_id);
					//find the node with that id in the network
					neighbor = returnNodeById(neighbor_id);
					neighbor.neighbors = neighbor.neighbors.filter(function(index) {
						return index != shape_id ;
					});
				}
			}

			//remove the node from the network
			network.nodes = network.nodes.filter(function (el) {
				return el.id != shape_id;
			});
			//update the used ids list
			usedIds = usedIds.filter(function(el){ 
				return el != shape_id; 
			});
			usedIds.sort();
			console.log("Used ids ", usedIds);
			//remove the shape from the graph
			cellView.model.remove();
			console.log(network);
		}
		//else if we are connecting nodes ======
		else if(linkSelect1){

			/*
			I selected the first node to link. 
			I need to select another one as the end of the link
			*/
			linkStart = cellView.model;
			linkSelect1 = false;
			linkSelect2 = true;
		}
		else if(linkSelect2){
			/*
			I selected 2 nodes to link. An edge will be created between
			them and their neighboring sets will be updated
			*/
			linkEnd = cellView.model;
			linkSelect2 = false;

			var link = new joint.dia.Link({
		        source: { id: linkStart.id },
		        target: { id: linkEnd.id }
		    });

			graph.addCell(link);
			linkSelect1 = true;

			//update neighborhood for nodes
			var shape1_node = returnNodeById(linkStart.attributes.prop["node_id"]);
			var shape2_node = returnNodeById(linkEnd.attributes.prop["node_id"]);

			shape1_node.neighbors.push(shape2_node.id);
			shape2_node.neighbors.push(shape1_node.id);
			console.log(network);

		}
	    
	});
 
 	//Callback to react to removing a link(edge) from the interface
 	graph.on('remove',function(cell){

 		if( (cell.attributes.type == "link") && !removingNode){
 			console.log("Remove link only selected");
 			var id1 = cell.getSourceElement().id;
 			var id2 = cell.getTargetElement().id;

 			console.log(id1);

 			network.nodes[id1].neighbors = network.nodes[id1].neighbors.filter(function (el) {
 				return el != id2;
 			});

			network.nodes[id2].neighbors = network.nodes[id2].neighbors.filter(function (el) {
 				return el != id1;
 			}); 			
 		}
 	});
 	
 	//returns a node object from the network
 	function returnNodeById(search_id){
 		if(network.nodes.length == 0){
 			console.log("Can't retrieve node from empty network");
 		}
 		else{
 			for(var i=0; i<network.nodes.length; i++){
 				if(network.nodes[i].id == search_id){
 					return network.nodes[i];
 				}
 			}
 			console.log("Searching for node by id unsuccesful");
 		}
 	}

    // Buttons ================================================================
	$("#add_btn").click(function(){
		addingNode = true;
		removingNode = false;
	});

	$("#rm_btn").click(function() {
		removingNode = true;
		addingNode = false;
	});

    $("#link_btn").click(function() {
    	linkSelect1 = true;
    });

    $(".btn").click(function(){
    	$(".btn").removeClass("btn_clicked");
    	$(this).addClass("btn_clicked");
    })

    function stopFunctionality(options){
    	switch(options){
    		case "all" :
		    	addingNode = false;
		    	removingNode = false;
		    	linkStart = false;
		    	linkEnd = false;
		    	removingLink = false;
		    	$(".btn").removeClass("btn_clicked");
		    	break;
		    case "add" :
		    	addingNode = false;
		    	$("#add_btn").removeClass("btn_clicked");
		    	break;
		    default: break;
		}
    }
 	//keyboard events ===========================================
   	document.addEventListener("keydown", function(event) {
    	if(event.keyCode == '27'){
    		stopFunctionality("all");
    	}
    });
});
