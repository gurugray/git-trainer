/* exported Graph */
function Graph(holder, w, h) {

    var nodes = [],
        links = [],
        labels = {},
        _data = {},
        raw = {},
        _self = this,
        NODE_RADIUS = 32,

        vis = d3.select(holder).append('svg:svg')
            .attr('width', '100%')
            .attr('height', h),

        force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .linkDistance(NODE_RADIUS * 3.5)
            .charge(-NODE_RADIUS * NODE_RADIUS / 2)
            .size([w, h]);

    vis.append('svg:defs').selectAll('marker')
            .data(['live', 'dead'])
        .enter()
        .append('svg:marker')
            .attr('id', String)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', NODE_RADIUS - 6)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .attr('class', String)
        .append('svg:path')
            .attr('d', 'M0, -3L10, 0L0, 3');

    function _getNode(oid) {
        return nodes.filter(function(elem) { return (elem.oid === oid); })[0];
    }

    function _isOidDead(oid) {
        return !!~_data._deadNodes.indexOf(oid);
    }

    force.on('tick', function() {
        vis.selectAll('line.link')
            .attr('class', function(d){
                return _isOidDead(d.source.oid) ? 'link dead' : 'link';
            })
            .attr('marker-end', function(d) {
                return _isOidDead(d.source.oid) ? 'url(#dead)' : 'url(#live)';
            })
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        vis.selectAll('.node')
            .attr('transform', function(d) {
                return 'translate(' + parseInt(d.x, 10) + ',' + parseInt(d.y, 10) + ')';
            })
            .attr('class', function(d){
                var cls = _isOidDead(d.oid) ? 'node dead' : 'node';
                cls += d.label ? ' head' : ' simple';
                return cls;
            });
    });

    function _restart() {

        force.nodes(nodes).links(links).start();

        vis.selectAll('line.link').data(links).exit().remove();

        vis.selectAll('line.link')
            .data(links).enter()
                .insert('svg:line', '.node')
                .attr('class', 'link');

        _drawNodes(
            nodes.filter(function(item) {
                return !item.label;
            }),
            '.head'
        );

        _drawNodes(
            nodes.filter(function(item) {
                return !!item.label;
            }),
            '.simple'
        )
            .append('text')
            .attr('class', 'labels')
            .attr('x', NODE_RADIUS + 8)
            .attr('y', '0.3em')
            .text(function(d) { return '← ' + d.label; });
    }

    function _drawNodes(nodes, cls) {
        var node = vis.selectAll('.node' + cls).data(nodes, function(d) { return d.oid + d.label; });

        node.enter()
            .append('g')
            .attr('class', 'node')
            .attr('data-oid', function(d) { return d.oid; })
            .call(force.drag);

        node.append('circle')
            .attr('r', NODE_RADIUS);

        node.append('text')
            .attr('x', '-2.15em')
            .attr('y', '0.4em')
            .text(function(d) { return d.oid; });

        node.exit().remove();
        return node;
    }

    this.init = function(data) {
        _self.dataUpdate(data);
    };

    this.dataUpdate = function(data) {
        _data = data,
        links = [],
        labels = {};
        raw = data.raw;

        labels = _.reduce(data.branches, function(result, item, key) {
            result[item] = [].concat(result[item] || [], key);
            return result;
        }, {});

        function _copyXY(nodeOut, nodeIn) {
            if (nodeIn) {
                nodeOut.x = nodeIn.x;
                nodeOut.y = nodeIn.y;
            }

            return nodeOut;
        }

        nodes = data.nodes.map(function(nodeOID) {
            var refNode = _getNode(nodeOID),
                parentNode,
                current = { oid: nodeOID, x: w / 2, y: h / 2 };

            if (refNode) {
                _copyXY(current, refNode);
            } else if (!refNode && (parentNode = _getNode(raw[nodeOID].parents[0]))) {
                _copyXY(current, { x: parentNode.x + NODE_RADIUS, y: parentNode.y + NODE_RADIUS });
            }

            if (labels[nodeOID]) {
                current.label = labels[nodeOID].join(', ')
                    .replace(data.HEAD, data.HEAD + ' HEAD');
            }

            if (nodeOID === data.STAGE) {
                current.label = '«stage»';
            }

            return current;
        });

        data.nodes.forEach(function(nodeOID) {
            raw[nodeOID].parents.forEach(function(parentOID) {
                if (parentOID !== null) {
                    links.push({
                        source: _getNode(nodeOID),
                        target: _getNode(parentOID)
                    });
                }
            });
        });

        _restart();
    };

  return this;

}
