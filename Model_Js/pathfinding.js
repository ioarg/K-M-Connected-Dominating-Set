/* This code will find all the possible paths between a start node s
and a destination node t. After that it will try to obtain a minimum vertex cut
that disconnects the given graph.
*/
var PATHS_DEBUGGING = true;
var debugPathString = "<p class=\"text-info\"><b>Debugging paths string</b></p>";

var Path = function(){
	vertices = [];
	complete = 0;	//1 if there is no other vertex to add, or 0 otherwise
}

var pathList = [];

//Returns all the dominator neighbors of the given node's id
function _getDominatorNeighbors(id){
	var node;
	var tempNode;
	var nodeList;
	nodeList = [];
	node = returnNodeById(id);
	for(var i=0; i<node.neighbors.length; i++){
		tempNode = returnNodeById(node.neighbors[i]);
		//get the dominators that are not already checked
		if(tempNode.dominator){
			nodeList.push(tempNode.id);
		}

	}
	return nodeList;
}

//It will create only the paths from the 1-hop neighbors of the start node
function _initializePathfinding(start, destination){
	var path;
	var domNeighbors;
	pathList = []; //reinitialize pathList
	domNeighbors = _getDominatorNeighbors(start.id);
	//for every neighbor of the start node make a new path
	for(var i=0; i< domNeighbors.length; i++){
		path = new Path();
		path.vertices = [];
		path.vertices.push(start.id);
		path.vertices.push(domNeighbors[i]);
		if(domNeighbors[i] == destination.id){
			path.complete = 1;
		}
		else{
			path.complete = 0;
		}
		pathList.push(path);
	}

}

//Checks if all the paths are complete
function _pathsComplete(){
	for(var i=0; i<pathList.length; i++){
		if(pathList[i].complete == 0){
			return false;
		}
	}
	return true;
}

//Returns a new path list object, without the path you wish to remove
function _removePath(list, path){
	var newList = [];
	var list1;
	var list2;
	var difference;
	var newPath;
	list2 = path["vertices"].slice();
	for(var i=0; i< list.length; i++){
		list1 = list[i]["vertices"].slice();
		if(list1.length == list2.length){
			difference = false;
			for(var k=0; k<list1.length; k++){
				if(list1[k] != list2[k]){
					difference = true;
					break;
				}
			}
			if(difference){
				newPath = new Path();
				newPath.vertices = list1.slice();
				newPath.complete = list[i].complete;
				newList.push(newPath);
			}
		}
		else{
			newPath = new Path();
			newPath.vertices = list1.slice();
			newPath.complete = list[i].complete;
			newList.push(newPath);
		}
	}
	return newList;
}

//return a new path list copied from the original list 
function _copyPathList(list){
	var tempPath;
	var newList = [];
	/*
	for(var i=0; i < list.length; i++){
		tempPath = new Path();
		tempPath.vertices = list[i].vertices.slice();
		tempPath.complete = list[i].complete;
		newList.push(tempPath);
	}*/
	newList = JSON.parse(JSON.stringify(list));
	console.log("New list : ", newList);
	return newList;
}
//Constructs the paths until all are complete - Finds all possible paths
//avoiding cycles
function _constructPaths(destination){
	var pathList2; 
	var vertex;
	var newPaths;
	var tempPath;
	while(!_pathsComplete()){
		pathList2 = _copyPathList(pathList);
		//for every path
		for(var i=0; i < pathList.length; i++){
			if(pathList[i].complete == 0){
				//take the last vertex of this path
				vertex = pathList[i].vertices[pathList[i].vertices.length-1];	
				//give me the neighbors of this vertex that are not already in the path -> avoid cycles
				newPaths = _.difference(_getDominatorNeighbors(vertex), pathList[i].vertices);
				if( (newPaths.length == 0) || (vertex == destination.id) ){
					pathList2[i].complete = 1;
				}
				else{ //the path hasn't ended yet
					for(var j=0; j < newPaths.length; j++){
						tempPath = new Path();
						tempPath.vertices = pathList[i].vertices.slice();
						tempPath.vertices.push(newPaths[j]);
						if(newPaths[j] == destination.id){
							tempPath.complete = 1;
						}
						pathList2.push(tempPath);
					}
					pathList2 = _removePath(pathList2, pathList[i]);
				}

			}
		}
		pathList = _copyPathList(pathList2); //update pathList with the new paths
	}
}

function _returnFirstCommonVertex(path1, path2){
	var tempList;
	tempList = _.intersection(path1["vertices"], path2["vertices"]);
	if (tempList.length > 0){
		return tempList[0];
	}
	return false;
}

//Obtain a minimum vertex cut using the paths found from the function above
function _obtainMinimumVertexCut(){
	var vertexCut = [];
	var firstVertex;
	var jointPathList = [];
	var disjointPathList = [];
	var disjoint = true; //is the path disjoint from the others?
	//check every two paths for common vertices
	for(var i=0; i<(pathList.length-1); i++){
		for(var j=(i+1); j<pathList.length; j++){
			//if they have common vertices, add the first one to the cut
			firstVertex = _returnFirstCommonVertex(pathList[i],pathList[j]);
			if(!firstVertex){
				vertexCut.push(firstVertex);
				jointPathList.push(pathList[j]);
				disjoint = false;
			}
		}
		//it might insert a path more than once but that doesn't matter
		//because of the difference function we use below
		if(!disjoint){
			jointPathList.push(pathList[i]);
			disjoint = true;
		}
	}
	//Get the disjoint paths that are left and add their first vertex to the cut
	//disjointPathList = _.difference(pathList, jointPathList);
	/*for(var m=0; m<){

	}
	for(var k=0; k<disjointPathList.length; k++){
		vertexCut.push(disjointPathList[k][0]);
	}*/
	return vertexCut;
}

//debug function ######
function _printPathsFound(){
	for(var i=0; i<pathList.length; i++){
		debugPathString += "<p>[ ";
		for(var j=0; j<pathList[i].vertices.length; j++){
			if(j == (pathList[i].vertices.length-1)){
				debugPathString += pathList[i].vertices[j];
			} 
			else{
				debugPathString +=  pathList[i].vertices[j] + " , ";
			}
		}
		debugPathString += " ]</p>";
	}
}

//Runs the pathfinding algorithm 
function runPathFinding(start, destination){
	var vertexCut;
	//find all the paths between start and destination
	debugPathString += "<p>Starting pathfinding between "+start.id+" and "+destination.id+"</p>";
	_initializePathfinding(start, destination);
	_constructPaths(destination);
	//vertexCut = _obtainMinimumVertexCut();
	//use only for debugging ###
	if(PATHS_DEBUGGING){
		_printPathsFound();
		//debugPathString += "<p>Vertex Cut =>"+ vertexCut +"</p>";
		debugPathString += "<p>End Step =======================</p>";
	}
}
