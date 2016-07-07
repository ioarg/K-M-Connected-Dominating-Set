$(document).ready(function(){

	//Network stuff ============================

	// A node 	
	var Node = function (id_in, neighbors, graphic_in){
		var id;
		var graphic;

		this.id = id_in;
		this.neighbors = neighbors;
		this.graphic = graphic_in;
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

	// Initialization =========================
	var network = new Network(); 
	var lastID = 0; //last used node id
	var panelOffset = $("#graph_panel").offset(); //the offset of the panel from the document, will be used for mouse events
	var addingNode = false; //if the add node button is active

	//Graphics stuff ===========================


	var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#graph_panel'),
        width: 800,
        height: 700,
        model: graph,
        gridSize: 1
    });

    /*
    var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    });

    var rect2 = rect.clone();
    rect2.translate(300);

    var link = new joint.dia.Link({
        source: { id: rect.id },
        target: { id: rect2.id }
    });

    graph.addCells([rect, rect2, link]);
	*/


	// Buttons =================
	$("#add_btn").click(function(){
		addingNode = true;
	});

    $("#graph_panel").click(function(){

    	if (addingNode){
	    	lastID ++;

	    	var circleShape = new joint.shapes.basic.Circle({
	    		position: { x: 30, y:30},
	    		size:{ width:35, height:35},
	    		attrs:{ circle: {fill: '#cccc00'}, text: { text : lastID, fill : 'white'}}
	    	});

	    	var node = new Node( lastID, [], circleShape);
	    	network.nodes.push(node);

	    	graph.addCell(circleShape);

	    	console.log(network);
	    }

    });

    $(".btn").click(function(){
    	$(".btn").removeClass("btn_clicked");
    	$(this).addClass("btn_clicked");
    });

 
   	document.addEventListener("keydown", function(event) {
    	if(event.keyCode == '27'){
    		addingNode = false;
    		$(".btn").removeClass("btn_clicked");
    	}
    });
});
