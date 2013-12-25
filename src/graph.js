function Graph(holder, w, h) {

    var nodes = [],
        links = [],
        texts = [],
        labels = {},
        _data = {},
        raw = {},

        _self = this;


    var fill = d3.scale.category20(),
        vis = d3.select(holder).append("svg:svg")
            .attr("width", '100%')
            .attr("height", h),

        force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .linkDistance(100)
            .charge(-700)
            .size([w, h]);

        vis.append("svg:defs").selectAll("marker")
                .data(["arrow"])
            .enter()
            .append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 26)
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .attr('class', 'arrow')
            .append("svg:path")
                .attr("d", "M0, -3L10, 0L0, 3");

    function _getNode(oid) {
        return nodes.filter(function(elem, i, q){ return (elem.oid == oid) })[0];
    }

    force.on("tick", function() {
        vis.selectAll("line.link")
            .attr("x1", function(d) { return d.source.x })
            .attr("y1", function(d) { return d.source.y })
            .attr("x2", function(d) { return d.target.x })
            .attr("y2", function(d) { return d.target.y });

        vis.selectAll(".node")
            .attr("transform", function(d) {
                return "translate(" + parseInt(d.x) + "," + parseInt(d.y) + ")";
            })
            .attr('class', function(d){
                return !!~_data._deadNodes.indexOf(d.oid) ?
                    'node dead' :
                    'node';
            });

        vis.selectAll(".labels")
            .attr("transform", function(d) {
                return "translate(" + parseInt(d.x+35) + "," + parseInt(d.y+6) + ")";
            });
    });

    function _restart() {

        force.nodes(nodes).links(links).start();

        vis.selectAll(".node").data(nodes).exit().remove();
        vis.selectAll("line.link").data(links).exit().remove();

        vis.selectAll(".labels").data(labels).exit().remove();

        vis.selectAll("line.link")
                .data(links)
            .enter().insert("svg:line", ".node")
                .attr("class", "link")
                .attr("x1", function(d) { return d.source.x })
                .attr("y1", function(d) { return d.source.y })
                .attr("x2", function(d) { return d.target.x })
                .attr("y2", function(d) { return d.target.y })
                .attr("marker-end", function(d) { return "url(#arrow)" });

    var node = vis.selectAll(".node")
            .data(nodes).enter()
            .append('g')
            .attr("class", "node")
            .attr("data-oid", function(d){ return d.oid })
            .call(force.drag);

        node.append("circle")
            .attr("r", 30);

        node.append("text")
            .attr("x", -23)
            .attr("y", 4)
            .attr("data-name-oid", function(d){ return d.oid })
            .text(function(d) { return d.oid });

        vis.selectAll("text.labels")
                .data(nodes, function(d) {return d.oid})
            .enter().insert("text")
                .attr("class", 'labels')
                .text(function(d) {
                    return (labels[d.oid].length)? ('← '+labels[d.oid].join(', ')):('');
                });
    }

    this.init = function(data){
        _self.dataUpdate(data);
    }

    this.dataUpdate = function(data) {
        _data = data,
        links = [],
        labels = {};
        var tmp = {};
        raw = data.raw;

        var new_nodes = [];

        data.nodes.forEach(function(nodeOID) {
            var node = _getNode(nodeOID);

           if (!node) {
                var parentNode = _getNode(raw[nodeOID].parents[0]);
                if (parentNode) {
                    node = _.clone(parentNode, true);
                    node.x -= 10;
                    node.y -= 10;
                } else {
                    node = {oid: nodeOID, x: w/2, y: h/2};
                }
            }
            tmp = {oid: nodeOID, x: node.x, y: node.y};

            new_nodes.push(tmp);
        });

        nodes = new_nodes;


        data.nodes.forEach(function(nodeOID) {
            raw[nodeOID].parents.forEach(function(parentOID){
                if (parentOID != null){
                    links.push({source: _getNode(nodeOID), target: _getNode(parentOID)});
                }
            });
        });

        var aBranches = d3.keys(data.branches);

        data.nodes.forEach(function(nodeOID){

            labels[nodeOID] = [];

            aBranches.forEach(function(branchName){
                if (data.branches[branchName] == nodeOID) {
                    labels[nodeOID].push(branchName);

                    if (branchName == data.HEAD) {
                        labels[nodeOID].push('HEAD');
                    };

                };
            });

            if (nodeOID == data.STAGE) {
                labels[nodeOID].push('«stage»');
            };
        });

        _restart();
    }

  return this;
}
