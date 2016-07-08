$(document).ready(function(){

	//Network Structure ==========================================

	// A node 	
	var Node = function (id_in, neighbors){
		var id;
		var graphic;

		this.id = id_in;
		this.neighbors = neighbors;
	}

	Node.prototype.getId = function(){
		return this.id;
	}

	Node.prototype.setId = function(id){
		this.id = id
	}

	//The network

	var Network = function (){
		this.nodes = [];
	} 

	// Initialization Globals =========================

	var network = new Network(); 
	var usedIds = [];
	var panelOffset = $("#graph_panel").offset(); //the offset of the panel from the document, will be used for mouse events
	var addingNode = false; //if the add node button is active
	var removingNode = false; //if the remoce node button is active


	//Graphics Management ==============================================================

	var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#graph_panel'),
        width: 800,
        height: 700,
        model: graph,
        gridSize: 1
    });

    paper.on('blank:pointerclick',function(event){

    	if (addingNode){
    		var newID;
	  		//set the new node's id
	    	if(usedIds.length == 0){
	    		newID = 0;
	    		usedIds.push();
	    	}

	  		//create the graphics shape
	    	var circleShape = new joint.shapes.basic.Circle({
	    		position: { x: event.pageX - panelOffset.left - 20, y: event.pageY - panelOffset.top - 20},
	    		size:{ width:35, height:35},
	    		attrs:{ circle: {fill: '#cccc00'}, text: { text : lastID, fill : 'white'}},
	    		prop:{ node_id : newID}
	    	});

	    	//stop adding a node while moving another
	    	circleShape.on("change:position",function(){
	   			stopFunctionality("all");
	    	});

	    	//add the new shape to the graph
	    	graph.addCell(circleShape);

	    	//create the node in the network
	    	var node = new Node( lastID, []);
	    	network.nodes.push(node);

	    	console.log(network);
	    }

    });

    //remove node if clicked && removingNode
    paper.on('cell:pointerclick', function(cellView, evt, x, y) { 

		if (removingNode){
			var shape_id = cellView.model.attributes.prop["node_id"];
			network.nodes = removeObjectFromArray(network.nodes, shape_id);
			lastID --; // remove one used id
			//remove the shape from the graph
			cellView.model.remove();
			console.log(network);
		}
	    
	});
 
 	//remove obj from array
 	var removeObjectFromArray = function(array, value){
	  for(var i = 0; i<array.length; i++){
	    if(_.invert(array[i])[value]){
	      var index = _.invert(array[i])[value];
	      }
		}
		array = _.reject(array, function(key){ return key[index] === value; });
		return array;
	}

    // Buttons ================================================================
	$("#add_btn").click(function(){
		addingNode = true;
		removingNode = false;
	});

	$("#rm_btn").click(function() {
		removingNode = true;
		addingNode = false;
		console.log("rm_button");
	});

    $(".btn").click(function(){
    	$(".btn").removeClass("btn_clicked");
    	$(this).addClass("btn_clicked");
    });

    function stopFunctionality(options){
    	switch(options){
    		case "all" :
		    	addingNode = false;
		    	removingNode = false;
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
    		console.log("i heard an ESC");
    	}
    });
});
