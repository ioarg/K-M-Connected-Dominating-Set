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
		return "Option unsupported in  _dominatorSetConnectivity()";
	}
	//console.log("Setting Connectivity ======>");
	while( _areAllDominators() == false ){
		if(options == "d"){
			//console.log("Checking the dominators for connectivity ",p);
			list = network.nodes.filter(function(index) {
				return (index.dominator == true) && ( _isPConnected(index,p) == false );
			});
		}
		else if(options == "n"){
			//console.log("Checking the dominatees for connectivity ",p);
			list = network.nodes.filter(function(index) {
				return (index.dominator == false) && ( _isPConnected(index,p) == false );
			});
		}
		//console.log("The list is now : ", list);
		//we have succeded
		if(list.length == 0){
			//console.log("Connectivity success $$$$$$$$");
			return "success";
		}
		//Reset all the preference values changed in previous invokations
		_resetAllPreferance();
		//Set preferences
		for(var j=0; j<list.length; j++){
			//take current node from the list
			thisNode = list[j];
			//if he has enough neighbors to make them dominators
			if(thisNode.neighbors.length < p){
				if(thisNode.dominator){
					return "Could not continue. Not enough neighbors for node "+ thisNode.id + " . Try a different value for K.";
				}
				else{
					return "Could not continue. Not enough neighbors for node "+ thisNode.id + " . Try a different value for M.";
				}
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
	return "Could not succeed with these K and M parameters. Please try with different values";
}

function _solveConstraint5(){
	var domListBefore;
	var domListAfter;
	var result;
	if( k>0 && m>0){
		/*console.log("Constructing K,M only with constraint (5) ======>");
		  console.log("K : ",k," M : ",m); */
		domListBefore = _returnAllDominatorIds();
		domListAfter = [-1,-2];
		while( _.difference(domListBefore, domListAfter).length != 0 ){
			domListBefore = _returnAllDominatorIds(); 
			//console.log("Dominator List before: ", domListBefore);
			result = _dominatorSetConnectivity(k, "d");
			if(result != "success"){
				return result;
			}
			result = _dominatorSetConnectivity(m ,"n");
			if(result != "success"){
				return result;
			}
			domListAfter = _returnAllDominatorIds();
			//console.log("Dominator List after: ", domListAfter);
		}
	}
	finalResultsStringKM += "<p>Extra dominators after K,M : " + dominatorListKM +"</p>";
	finalResultsStringKM += "<p>All the dominators : "+ _returnAllDominatorIds() +"</p>";
	return "no_error";
}

//Rerturns the minimum connectivity = the minimum number of neighbors a node has
function _check_K_M_Connectivity(vertexCut){
	var node;
	var tempNode;
	var count;
	for(var i=0; i<vertexCut.length; i++){
		node = returnNodeById(vertexCut[i]);
		count = 0;		
		for(var j=0; j<node.neighbors.length; j++){
			tempNode = returnNodeById(node.neighbors[j]);
			if(tempNode.dominator){
				count ++;
			}
		}
		if(node.dominator && (count < k)){
			return "Constraint (3) failed on dominator node " + node.id + " ."; 
		}
		else if ((!node.dominator) && (count < m)){
			return "Constraint (3) failed on dominatee node " + node.id + " .";
		}
	}
	return "success";
}

//The basic K,M algorithm
function k_m_algorithm(){
	var constraint3 = true;
	var dominatorListAll;
	var node1;
	var node2;
	var message;
	var vertexCut;
	
	//Solve constraint 5 of the Ahn-Park paper ...........
	message = _solveConstraint5();
	//console.log("Message is : ", message);
	if(message != "no_error"){
		return message;
	}
	/*Calculate step 4 ..........
	If constraint (5) is solved succesfully and (3) is enabled calculate step 4 of the algorithm.
	For every two (non-neighbors) dominators find all the paths between them and get
	a minimum vertex cut. Then check if the cut satisfies constraint (3) (is k,m connected). If not, then
	the algorithm has failed to produce a minimum K,M CDS for these K and M parameters)
	*/
	if(constraint3){
		dominatorListAll = _.union(dominatorListKM,dominatorListWL);
		for(var i=0; i<(dominatorListAll.length-1); i++){
			node1 = returnNodeById(dominatorListAll[i]);
			for(var j=(i+1); j<dominatorListAll.length; j++){
				node2 = returnNodeById(dominatorListAll[j]);
				//only if they are not neighbors
				if( _.indexOf( node1.neighbors, node2.id ) == -1){
					vertexCut = runPathFinding(node1, node2);
					message = _check_K_M_Connectivity(vertexCut);
					if(message != "success"){
						return message;
					}
				}
			}
		}
	}

	return "no_error";
}