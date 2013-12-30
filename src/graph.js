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
                .data(["live", "dead"])
            .enter()
            .append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 26)
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .attr('class', String)
            .append("svg:path")
                .attr("d", "M0, -3L10, 0L0, 3");

    function _getNode(oid) {
        return nodes.filter(function(elem, i, q){ return (elem.oid == oid) })[0];
    }

    force.on("tick", function() {
        vis.selectAll("line.link")
            .attr("class", function(d){
                return !!~_data._deadNodes.indexOf(d.source.oid) ?
                    'link dead' :
                    'link'
            })
            .attr("marker-end", function(d) {
                return !!~_data._deadNodes.indexOf(d.source.oid) ?
                    'url(#dead)' :
                    'url(#live)'
            })
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
    });

    function _restart() {

        force.nodes(nodes).links(links).start();

        var node = vis.selectAll(".node").data(nodes, function(d) { return d.oid+d.label; });
        node.exit().remove();

        vis.selectAll("line.link").data(links).exit().remove();

        vis.selectAll("line.link")
                .data(links)
            .enter().insert("svg:line", ".node")
                .attr("class", "link")
                .attr("x1", function(d) { return d.source.x })
                .attr("y1", function(d) { return d.source.y })
                .attr("x2", function(d) { return d.target.x })
                .attr("y2", function(d) { return d.target.y })
                .attr("marker-end", function(d) { return "url(#live)" });

        node.enter()
            .append('g')
            .attr("class", "node")
            .attr("data-oid", function(d){ return d.oid })
            .call(force.drag);

        node.append("circle")
            .attr("r", 30);

        node.append("text")
            .attr("x", -23)
            .attr("y", 4)
            .text(function(d) { return d.oid });

        node
            .append("text")
            .attr("class", 'labels')
            .attr("x", 35)
            .attr("y", 4)
            .text(function(d) {
                return d.label ? '← '+ d.label : '';
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

        labels = _.reduce(data.branches, function(result, item, key) {
            result[item] = [].concat(result[item] || [], key);
            return result;
        }, {});

        nodes = data.nodes.map(function(nodeOID) {
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

            if (labels[nodeOID]) {
                tmp.label = labels[nodeOID].join(', ')
                    .replace(data.HEAD, data.HEAD+' HEAD');
            };

            if (nodeOID == data.STAGE) {
                tmp.label = '«stage»';
            };

            return tmp;
        });

        data.nodes.forEach(function(nodeOID) {
            raw[nodeOID].parents.forEach(function(parentOID){
                if (parentOID != null){
                    links.push({source: _getNode(nodeOID), target: _getNode(parentOID)});
                }
            });
        });

        _restart();
    }

  return this;
}
