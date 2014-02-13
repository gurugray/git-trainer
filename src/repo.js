/*jshint -W058 */ //not alerting about invoking constructors without ()
/* global jsSHA */
/* exported Repo */
function Repo() {
    var _data = {},
        _idx = [],
        HEAD = 'master',
        STAGE = null,
        UP_TO_DATE = 1,
        FAST_FORWARDABLE = 2,
        NOT_FAST_FORWARDABLE = 0,

        branches = {
            master: null
        };

    function Node(parents) {
        var shaObj = new jsSHA('salt' + Math.random() + (new Date).valueOf(), 'TEXT');
        return {
            oid: shaObj.getHash('SHA-1', 'HEX').substring(0, 7),
            parents: parents ? parents : [branches[HEAD], null]
        };
    }

    function _canFF(bName, testName) {
        if (_.include(_getParents(branches[bName]), branches[testName])) {
            return UP_TO_DATE;
        } else if (_.include(_getParents(branches[testName]), branches[bName])) {
            return FAST_FORWARDABLE;
        } else {
            return NOT_FAST_FORWARDABLE;
        }
    }

    function _getParents(oid) {
        var rv = [];

        if (null === oid) {
            return null;
        }

        rv.push(oid);

        rv.push(_getParents(_data[oid].parents[0]));
        rv.push(_getParents(_data[oid].parents[1]));

        return _.compact(_.flatten(rv));
    }

    function isBranchExist(onto) {
        return !!~Object.keys(branches).indexOf(onto);
    }

    this.add = function(parents) {
        if (STAGE !== null) {
            return false;
        }

        var node = new Node(parents);

        _data[node.oid] = node;
        _idx.push(node.oid);

        STAGE = node.oid;

        return node;
    };

    this.commit = function() {
        if (STAGE !== null) {
            branches[HEAD] = STAGE;
            STAGE = null;
        }
    };

    this.revert = function() {
        this.add();
        this.commit();
    };

    this.cherryPick = function() {
        this.add();
        this.commit();
    };

    this.branch = function(name) {
        var args = Array.prototype.slice.call(arguments)[0];
        if (branches[name]) return false;

        if (args.length === 1) {
            branches[name] = branches[HEAD];
            return true;
        }
        if (args.length === 2) {
            branches[args[0]] = args[1];
            return true;
        }

        return false;
    };

    this.branchRemove = function(name) {
        if (branches[name]) {
            branches = _.omit(branches, name);
            return true;
        } else {
            return false;
        }
    };

    this.switchToBranch = function(name) {
        if (branches[name]) {
            HEAD = name;
            return true;
        } else {
            return false;
        }
    };

    this.merge = function(branchNames, noFF) {

        if ((branchNames.length === 1) && !noFF){

            if (!isBranchExist(branchNames[0]))
                return false;

            var mFF = _canFF(HEAD, branchNames[0]);

            if ( mFF === UP_TO_DATE) {
                return false;
            } else if (mFF === FAST_FORWARDABLE) {
                branches[HEAD] = branches[branchNames[0]];
                return true;
            }
        }

        var parents = [];

        parents.push(branches[HEAD]);

        branchNames.forEach(function(eName){
            isBranchExist(eName) && parents.push(branches[eName]);
        });

        this.add(parents);
        this.commit();

    };

    this.reset = function(level) {
        var startPoint = branches[HEAD];
        for (var i = 0; i < level; i++){
            startPoint = _data[startPoint].parents[0];
        }

        branches[HEAD] = startPoint;
    };

    this.resetTo = function(oid) {
        branches[HEAD] = oid;
    };

    this.rebase = function (onto) {

        if (!isBranchExist(onto))
            return false;

        if (!!~[FAST_FORWARDABLE, UP_TO_DATE].indexOf(_canFF(HEAD, onto))) {
            this.merge([onto], false);
        }

        var oidsB = _getParents(branches[HEAD]),
            oidsO = _getParents(branches[onto]),
            common = _.intersection(oidsB, oidsO),
            reb = _.difference(oidsB, common).reverse(),
            repo = this;

        if (common[0] !== branches[onto]) {

            branches[HEAD] = branches[onto];

            reb.forEach(function (){
                repo.add();
                repo.commit();
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

    this.getData = function() {
        return {
            raw: _data,
            nodes: _idx,
            branches: branches,
            HEAD: HEAD,
            STAGE: STAGE,
            _deadNodes: this._findDead()
        };
    };

    this.gc = function() {
        _idx = _.difference(_idx, this._findDead());
    };

    return this;
}
