Calculation Of Minimum Sized (k,m) Connected Dominating Set (CDS)

//Purpose of software ============================

This software uses the algorithm of Wu & Li and the process of the Namsu Ahn & Sungsoo Park 
paper to construct a minimum sized Connected Dominating Set. The k parameter means that every 
dominator has at least k dominator neighbors and the m parameter means that every dominatee 
has at least m dominator neighbors.
After the network construction, it uses the Wu & Li algorithm to calculate a minimum sized CDS. 
Then, based on the Ahn & Park process, it tries to expand that CDS to construct a minimum (k,m) 
CDS, if possible for the given k and m parameters. If not possible, it notifies the user to 
enter different k and m values.

The papers referenced above are:
On Calculating Connected Dominating Set for Efficient Routing in Ad Hoc Wireless Networks
Jie Wu and Hailan Li

An optimization algorithm for the minimum k-connected m-dominating set problem in wireless sensor networks
Namsu Ahn - Sungsoo Park

//Files explainded =========================

Apart from the Css files, the functionality is divided in the Model_Js files and the View_Js.
In the Model_Js we have the files that manage the background stuff, like the construction of 
the network and the algrorithms run on it. 
In the View_Js files we have the management of the
page view (apart from the graph view which is tied to the network construction in Model_Js).
There are also external libary files in the 'External' folders.
The network visual graph was made with joint.js.

kConnected.html : The application's main file which displays the app. Instructions for use are displayed
in the main page.

network_manager.js : handles the construction and updates of the network, both
as a graph displayed inside a view and the network global variable which contains all the network info.
Every interaction with the graph view is handled here and NOT in the viewManager.js, because it is tied
to the update of the network information.

algorithm.js : uses the network constructed by the network_manager.js to run the algorithms described
above.

viewManager.js : it handles some button and page view functionality, along with painting the dominator 
nodes after the algorithms finish their execution.