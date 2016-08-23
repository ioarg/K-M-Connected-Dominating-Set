/* This code will find all the possible paths between a start node s
and a destination node t. After that it will try to obtain a minimum vertex cut
that disconnects the given graph.
*/
var PATHS_DEBUGGING = true;
var debugPathString = "<p class=\"text-info\"><b>Debugging paths string ########</b></p>";

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
	newList = JSON.parse(JSON.stringify(list));
	return newList;
}

//locates a path in given list and returns an index to it
function _returnPathIndex(list, path){
	var list1;
	var list2;
	var difference;
	var index = -1;
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
			if(!difference){
				index = i;
			}
		}
	}
	return index;
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
					//Find the appropriate path - Due to adding/removing paths the order of paths might have changed
					//so we need to make sure we get the correct path 
					pathList2[ _returnPathIndex(pathList2, pathList[i]) ].complete = 1;
				/*	//Debugging code only inside following if() #####
					if(PATHS_DEBUGGING){
						debugPathString += "<p>Path end - nowhere to go, the vertex was "+vertex+"</p>";
					}*/
				}
				else{ //the path hasn't ended yet
					for(var j=0; j < newPaths.length; j++){
						tempPath = new Path();
						tempPath.vertices = pathList[i].vertices.slice();
						tempPath.vertices.push(newPaths[j]);
						if(newPaths[j] == destination.id){
							tempPath.complete = 1;
						}
						else{
							tempPath.complete = 0;
						}
						pathList2.push(tempPath);
						/*//Debugging code only inside following if() #####
						if(PATHS_DEBUGGING){
							debugPathString += "<p>Added vertex " + newPaths[j] + "</p>";
						}*/
					}
					pathList2 = _removePath(pathList2, pathList[i]);
				}

			}
		}
		pathList = _copyPathList(pathList2); //update pathList with the new paths
	}
}

//From all the paths found,, keep the ones that end to the destination
function _keepDestinationPaths(destination){
	var newList = [];
	var newPath;
	pathList.forEach(function(elem){
		if(elem["vertices"][elem["vertices"].length - 1] == destination.id){
			newPath = new Path();
			newPath.vertices = elem["vertices"].slice();
			newPath.complete = elem["complete"];
			newList.push(newPath);
		}
	});
	return newList;
}

function _returnFirstCommonVertex(path1, path2){
	var tempList;
	tempList = _.intersection(path1["vertices"], path2["vertices"]);
	if (tempList.length > 2){//without start and end
		return tempList[1];
	}
	return false;
}

//Obtain a minimum vertex cut using the paths found from the function above
function _obtainMinimumVertexCut(destination){
	var vertexCut = [];
	var firstVertex;
	var jointPathsIndexes = [];
	var disjointPathsIndexes = [];
	var disjoint = true; //is the path disjoint from the others?
	var tempPath;
	//check every two paths for common vertices
	for(var i=0; i<(pathList.length-1); i++){
		for(var j=(i+1); j<pathList.length; j++){
			//if they have common vertices, add the first one to the cut
			firstVertex = _returnFirstCommonVertex(pathList[i],pathList[j]);
			if(firstVertex != false){
				vertexCut.push(firstVertex);
				jointPathsIndexes.push(j);
				disjoint = false;
			}
		}
		//it might insert a path more than once but that doesn't matter
		//because of the _.uniq() function we use below
		if(!disjoint){
			jointPathsIndexes.push(i);
			disjoint = true;
		}
	}
	jointPathsIndexes = _.uniq(jointPathsIndexes);
	disjointPathsIndexes = _.difference( _.range(pathList.length), jointPathsIndexes);
	disjointPathsIndexes.forEach(function(elem){
		vertexCut.push(pathList[elem].vertices[1]); //we kept the start node so we need the next vertex => vertices[1]
	});
	vertexCut = _.uniq(vertexCut);
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
	pathList = []; //reinitialize pathList
	//find all the paths between start and destination
	debugPathString += "<p>Starting pathfinding between "+start.id+" and "+destination.id+" =========></p>";
	_initializePathfinding(start, destination);
	_constructPaths(destination);
	//Debugging code only inside following if() #####
	if(PATHS_DEBUGGING){
		debugPathString += "All possible paths found .....";
		_printPathsFound();
	}
	console.log("pathList : ", pathList);
	pathList = _keepDestinationPaths(destination);
	//Debugging code only inside following if() #####
	if(PATHS_DEBUGGING){
		debugPathString += "Paths from start to destination ....";
		_printPathsFound();
	}
	vertexCut = _obtainMinimumVertexCut(destination);
	//Debugging code only inside following if() #####
	if(PATHS_DEBUGGING){
		debugPathString += "<p>Vertex Cut => [ ";
		for(var l=0; l<vertexCut.length; l++){
			debugPathString += vertexCut[l] + " ";
		}
		debugPathString += "]</p>";
	}
}
