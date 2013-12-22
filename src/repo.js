function Repo() {
    var _data = {},
        _idx = [],
        _root = null,
        _self = null,
        HEAD = 'master',
        STAGE = null,

        branches = {
            master: null
        };

    function _Node(parents) {
        return {
            oid: SHA1('salt'+Math.random()+(new Date()).valueOf()).substring(0,7),
            parents: parents ? parents : [branches[HEAD], null]
        };
    }

    _self = this;

    this.add = function(parents){


        if (STAGE != null) {
            return false;
        }

        var node = new _Node(parents);

        _data[node.oid] = node;
        _idx.push(node.oid);

        STAGE = node.oid;

        return node;
    };

    this.commit = function() {
        if (STAGE != null) {
            branches[HEAD] = STAGE;
            STAGE = null;
        }
    };

    this.revert = function(oid) {
        _self.add();
        _self.commit();
    }

    this.cherryPick = function(oid) {
        _self.add();
        _self.commit();
    }


    this.branch = function(name){
        var args = Array.prototype.slice.call(arguments)[0];
        if (branches[name]) return false;

        if (args.length == 1) {
            branches[name] = branches[HEAD];
            return true;
        }
        if (args.length == 2) {
            branches[args[0]] = args[1];
            return true;
        }

        return false;
    };

    this.branchRemove = function(name){
        if (branches[name]) {
            branches = _.omit(branches, name);
            return true;
        } else {
            return false;
        }
    };


    this.switchToBranch = function(name){
        if (branches[name]) {
            HEAD = name;
            return true;
        } else {
            return false;
        }
    };

    this.merge = function(branchNames, noFF) {

        if ((branchNames.length == 1) && !noFF){
            var mFF = _canFF(HEAD, branchNames[0]);

            if ( mFF == 1) {
                //allready up to date
                return false;
            } else if (mFF == 2) {
                branches[HEAD] = branches[branchNames[0]];
                return true;
            }
        }

        var parents = [];

        parents.push(branches[HEAD]);

        branchNames.forEach(function(eName){
            parents.push(branches[eName]);
        });

        _self.add(parents);
        _self.commit();

    };

    this.reset = function(level)
    {
        var startPoint = branches[HEAD];
        for (var i = 0; i < level; i++){
            startPoint = _data[startPoint].parents[0];
        }

        branches[HEAD] = startPoint;
    };

    this.resetTo = function(oid)
    {
        branches[HEAD] = oid;
    };

    this.rebase = function (onto) {

        if (_canFF(HEAD, onto) > 0) {
            _self.merge([onto], false);
        }

        var oidsB = _getParents(branches[HEAD]),
            oidsO = _getParents(branches[onto]),
            common = _.intersection(oidsB, oidsO),
            reb =_.difference(oidsB, common).reverse();

        if (common[0] != branches[onto]) {

                branches[HEAD] = branches[onto];

                reb.forEach(function (oid){
                _self.add();
                _self.commit();
            });
        }

        return true;
    };

    this._findDead = function() {
        var kBranches = _.keys(branches),
            rv = [];

        kBranches.forEach(function(bName){
            rv = _.union(rv, _getParents(branches[bName]));
        });

        rv = _.difference(_idx, rv);

        return rv;
    };

    _canFF = function(bName, testName) {
        var oids = _getParents(branches[bName]);

        if (_.include(_getParents(branches[bName]), branches[testName])) {
            return 1;
        } else if (_.include(_getParents(branches[testName]), branches[bName])) {
            return 2;
        } else {
            return 0;
        }
    };

    _getParents = function(oid){
        var rv = [];

        if (null == oid) {
            return null;
        }

        rv.push(oid);

        rv.push(_getParents(_data[oid].parents[0]));
        rv.push(_getParents(_data[oid].parents[1]));

        return _.compact(_.flatten(rv));
    };

    _getBranchNodes = function(bName){

        var currentPoint = branches[bName],
            rv = [];

        do {
            rv.push(currentPoint);
            currentPoint = (_data[currentPoint].parents)? (_data[currentPoint].parents[0]):(null);
        } while (null != currentPoint);

        currentPoint = branches[bName];

        do {
            rv.push(currentPoint);
            currentPoint = (_data[currentPoint].parents && _data[currentPoint].parents[1])? (_data[currentPoint].parents[1]):(null);
        } while (null != currentPoint);

        rv = _.uniq(rv);

        return rv;
    };

    this.getData = function(){
        return {
            raw: _data,
            nodes: _idx,
            branches: branches,
            HEAD: HEAD,
            STAGE: STAGE,
            _deadNodes: _self._findDead()
        };
    };

    this.gc = function(){
        _idx = _.difference(_idx, _self._findDead());
    };

    return this;
}
