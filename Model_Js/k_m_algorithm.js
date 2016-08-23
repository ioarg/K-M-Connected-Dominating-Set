/*
This file will handle the K,M algorithm functionality. It will use the
network object created in network_manager.js
*/
var dominatorListKM = [];	//the dominators after the K,M algorithm
var finalResultsStringKM = "<p class=\"text-info\"><b>K,M algorithm results</b></p>";
var k = -1;					//The k of the k,m connected problem
var m = -1; 				//The m of the k,m connected problem

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
	if( countDoms >= p){
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
	while( _areAllDominators() == false ){
		if(options == "d"){
			console.log("Checking the dominators for connectivity ",p);
			list = network.nodes.filter(function(index) {
				return (index.dominator == true) && ( _isPConnected(index,p) == false );
			});
		}
		else if(options == "n"){
			console.log("Checking the dominatees for connectivity ",p);
			list = network.nodes.filter(function(index) {
				return (index.dominator == false) && ( _isPConnected(index,p) == false );
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
			//if he has enough neighbors to make them dominators
			if(thisNode.neighbors.length < p){
				return false;
			}
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
		network.nodes[returnNodeIndexById(candidate.id)].dominator = true;
		dominatorListKM.push(candidate.id);
		console.log("New dominator : ", candidate.id);
	}
	return false;
}

function _solveConstraint5(){
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
		domListAfter = [-1,-2];
		while( _.difference(domListBefore, domListAfter).length != 0 ){
			domListBefore = _returnAllDominatorIds(); 
			console.log("Dominator List before: ", domListBefore);
			result = _dominatorSetConnectivity(k, "d");
			if(!result){
				message = "Cannot calculate with this K. Please give another value for K.";
				return message;
			}
			result = _dominatorSetConnectivity(m ,"n");
			if(!result){
				message = "Cannot calculate with this M. Please give another value for M.";
				return message;
			}
			domListAfter = _returnAllDominatorIds();
			console.log("Dominator List after: ", domListAfter);
		}
	}
	finalResultsStringKM += "<p>Extra dominators after K,M : " + dominatorListKM +"</p>";
	finalResultsStringKM += "<p>All the dominators : "+ _returnAllDominatorIds() +"</p>";
	return message;
}

//Rerturns the minimum connectivity = the minimum number of neighbors a node has
function _findMinimumConnectivity(){
	var minimum = network.nodes[0].neighbors.length;
	for(var i=1; i<network.nodes.length; i++){
		if(network.nodes[i].neighbors.length < minimum){
			minimum = network.nodes[i].neighbors.length;
		}
	}
	return minimum;
}

//The basic K,M algorithm
function k_m_algorithm(){
	var formulation = {constraint3: true, constraint8: false};
	var dominatorListAll;
	var node1;
	var node2;
	var message = "no_error";
	var maximum;
	//Check if it is possible to achieve K,M conectivity with the given values
	maximum = _findMinimumConnectivity();
	if((k > maximum) || (m > maximum)){
		message = "Make sure both K and M are <= " + maximum;
		return message;
	}
	//Solve constraint 5 ...........
	_solveConstraint5();
	console.log("Message is : ", message);
	if(message != "no_error"){
		return message;
	}
	/*Calculate step 4 ..........
	If constraint (5) is solved succesfully and (3) is enabled calculate step 4 of the algorithm.
	For every two dominators find all the paths between them and get
	a minimum vertex cut. Then check if the cut satisfies constraint (3).
	*/
	if(formulation.constraint3){
		dominatorListAll = _.union(dominatorListKM,dominatorListWL);
		for(var i=0; i<(dominatorListAll.length-1); i++){
			for(var j=(i+1); j<dominatorListAll.length; j++){
				node1 = returnNodeById(dominatorListAll[i]);
				node2 = returnNodeById(dominatorListAll[j]);
				runPathFinding(node1, node2);
			}
		}
	}

	return message;
}