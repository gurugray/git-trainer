/* exported Graph */
function Graph(holder, w, h) {

    var nodes = [],
        links = [],
        labels = {},
        _data = {},
        raw = {},
        NODE_RADIUS = 32,
        GAPLEFT = NODE_RADIUS + 10,
        GAPRIGHT = GAPLEFT + 10,

        vis = d3.select(holder).append('svg:svg')
            .attr('width', '100%')
            .attr('height', h),

        force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .linkDistance(NODE_RADIUS * 3.5)
            .charge(-NODE_RADIUS * NODE_RADIUS / 1.5)
            .size([w, h]);

    vis.append('svg:defs').selectAll('marker')
            .data(['live', 'dead'])
        .enter()
        .append('svg:marker')
            .attr('id', String)
            .attr('viewBox', '0 200 400 0.001')
            .attr('refY', 200 )
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .attr('class', String)
        .append('svg:path')
            .attr('d', 'M 0 0 L 400 200 L 0 400 z');

    function _getNode(oid) {
        return nodes.filter(function(elem) { return (elem.oid === oid); })[0];
    }

    function _isOidDead(oid) {
        return !!~_data._deadNodes.indexOf(oid);
    }

    force.on('tick', function() {

        vis.selectAll('line.link')
            .classed({
                dead: function(d) { return _isOidDead(d.source.oid); }
            })

            .attr('marker-end', function(d) {
                return _isOidDead(d.source.oid) ? 'url(#dead)' : 'url(#live)';
            })

            .attr({
                x1: function(d) {
                        var x1 = d.source.x, y1 = d.source.y, x2 = d.target.x, y2 = d.target.y;
                        return (GAPLEFT * (x2-x1) / Math.sqrt( (x2-x1) * (x2-x1) + (y2-y1) * (y2-y1) ) ) + x1;
                    },

                y1: function(d) {
                        var x1 = d.source.x, y1 = d.source.y, x2 = d.target.x, y2 = d.target.y;
                        return (GAPLEFT * (y2-y1) / Math.sqrt( (x2-x1) * (x2-x1) + (y2-y1) * (y2-y1) ) ) + y1;
                    },

                x2: function(d) {
                        var x1 = d.source.x, y1 = d.source.y, x2 = d.target.x, y2 = d.target.y;
                        return x2 - (GAPRIGHT * (x2-x1) / Math.sqrt( (x2-x1) * (x2-x1) + (y2-y1) * (y2-y1) ) );
                    },

                y2: function(d) {
                        var x1 = d.source.x, y1 = d.source.y, x2 = d.target.x, y2 = d.target.y;
                        return y2 - (GAPRIGHT * (y2-y1) / Math.sqrt( (x2-x1) * (x2-x1) + (y2-y1) * (y2-y1) ) );
                    }
            });

        vis.selectAll('.node')
            .attr('transform', function(d) {
                return 'translate(' + parseInt(d.x, 10) + ',' + parseInt(d.y, 10) + ')';
            })
            .classed({
                dead: function(d) { return _isOidDead(d.oid); },
                head: function(d) { return !!d.label; },
                simple: function(d) { return !d.label; }
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
            .attr('y', '0.4em')
            .text(function(d) { return d.oid; });

        node.exit().remove();
        return node;
    }

    function _dataUpdate(data) {
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
    }

    return {
        dataUpdate: _dataUpdate
    };

}
