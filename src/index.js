/*borschik:include:repo.js*/
/*borschik:include:graph.js*/
/*borschik:include:command-line.js*/
/*borschik:include:git-commander.js*/

/* global Graph, Repo, CommandLine, GitCommander */

var myRepo = new Repo(),
    myGraph = new Graph('.demo', window.innerWidth, window.innerHeight-5),
    myCommander = new GitCommander(myRepo),

commandLine = new CommandLine('.command-line', function(command) {
    myCommander.run(command);
    myGraph.dataUpdate(myRepo.getData());
});

document.querySelector('.demo').addEventListener('dblclick', function(e) {
    if (e.srcElement && e.srcElement.tagName === 'circle') {
        commandLine.append(e.srcElement.parentNode.dataset.oid);
    }
});
