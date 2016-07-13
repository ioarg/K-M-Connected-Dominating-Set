/*
This file will handle the K,M algorithm functionality. It will use the
network object created in network_manager.js
*/

dominatorListKM = [];	//the dominators after the K,M algorithm
finalResultsStringKM = "<p class=\"text-info\"><b>K,M algorithm results</b></p>";
k = -1;					//The k of the k,m connected problem
m = -1; 				//The m of the k,m connected problem

//Return all the dominator nodes ids
var _returnAllDominatorIds = function(){
	var list = [];
	for(var i=0; i<network.nodes.length; i++){
		if(network.nodes[i].dominator == true){
			list.push(network.nodes[i].id);
		}
	}
	return list;
}

//Checks if all the nodes have become dominators after our calculations
//If so, some algorithms should stop execution
var _areAllDominators = function(){
	for(var i=0; i<network.nodes.length; i++){
		if(network.nodes[i].dominator == false){
			return false;
		}
	}
	return true;
}

//Resets the preferedBy property of the nodes
var _resetAllPreferance = function(){
	for(var i=0; i<network.nodes.length; i++){
		network.nodes[i].preferedBy = 0;
	}
}

//Checks if the node is has p dominator neighbors - p-connected
var _isPConnected = function(node,p){
	var countDoms = 0;
	for(var i=0; i<node.neighbors.length; i++){
		if(network.nodes[returnNodeIndexById(node.neighbors[i])].dominator == true){
			countDoms ++;
		}
	}
	console.log("counter of doms is : ", p);
	if( countDoms == p){
		return true;
	}
	return false;
}

//It will try to make a node list p-connected (everyone on the list
//connected with p dominators) if possible
//options can only be ["d", "n"] representing "dominator", "node" (dominatee)
var _dominatorSetConnectivity = function(p, options){
	var thisNode;
	var candidate;
	var list = []; //the list of nodes that we want to make p connected
	if(options != "d" && options != "n"){
		return false;
	}
	console.log("Setting Connectivity ======>");
	if( _areAllDominators() == false ){
		if(options == "d"){
			console.log("Checking for dominators for connectivity : ",p);
			list = network.nodes.filter(function(index) {
				return (index.dominator == true) && ( isPConnected(index,p) == false );
			});
		}
		else if(options == "n"){
			console.log("Checking for dominatees for connectivity : ",p);
			list = network.nodes.filter(function(index) {
				return (index.dominator == false) && ( isPConnected(index,p) == false );
			});
		}
		console.log("The list is now : ", list);
		//we have succeded
		if(list.length == 0){
			console.log("Connectivity success $$$$$$$$");
			return true;
		}
		//Reset all the preference values changed in previous invokations
		_resetAllPreferance();
		//Set preferences
		for(var j=0; j<list.length; j++){
			//take current node from the list
			thisNode = list[j];
			//for each one of his neighbors
			for(var k=0; k<thisNode.neighbors.length; k++){
				/*
				If they are a dominatee, increase their preferedBy property.
				This property will show us how many other nodes from the list
				have this dominatee as a neighbor. 
				*/
				if(network.nodes[returnNodeIndexById(thisNode.neighbors[k])].dominator == false){
					network.nodes[returnNodeIndexById(thisNode.neighbors[k])].preferedBy ++;
				}
			}
		}
		/*
		Find the node with the maximum preferedBy property. This one is the best
		candidate to be a dominator, because he has the most neighbors from the 
		given list. So by making this one a dominator, the connectivity of as 
		many nodes as possible is updated at once.
		*/
		candidate = _.max( network.nodes, function(el){ return el.preferedBy;} );
		console.log("Candidate : ", candidate);
		//make this candidate dominator
		candidate.dominator = true;
		dominatorListKM.push(candidate.id);
		console.log("New dominator : ", candidate.id);
		console.log(network);
	}
	return false;
}

//The basic K,M algorithm
function k_m_algorithm(){
	var formulation = {constraint3: false, constraint8: false};
	var domListBefore;
	var domListAfter;
	var result;
	var message = "no_error";
	if( k>0 && m>0){
		//first we try to make a minimum k-m network with only 
		//constraints (5) of the Ahn-Park paper ===========================================
		console.log("Constructing K,M only with constraint (5) ======>");
		console.log("K : ",k," M : ",m);
		domListBefore = _returnAllDominatorIds();
		domListAfter = [];
		if(domListBefore != domListAfter){
			domListBefore = _returnAllDominatorIds(); 
			console.log("Dominator List before: ", domListBefore);
			result = _dominatorSetConnectivity(k, "d");
			if(!result){
				message = "Cannot calculate with this K. Please give another value for K.";
				//break;
			}
			result = _dominatorSetConnectivity(m ,"n");
			if(!result){
				message = "Cannot calculate with this M. Please give another value for M.";
				//break;
			}
			domListAfter = _returnAllDominatorIds();
			console.log("Dominator List after: ", domListAfter);
		}
	}
	finalResultsStringKM += "<p>Dominators after K,M : " + dominatorListKM +"</p>";
	console.log("Message is : ", message);
	return message;
}

