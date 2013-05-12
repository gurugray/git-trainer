function gitCommander(repo) {

    var commands = {

            'branch': function(options) {
                if ( '-d' == options[0] ) {
                    repo.branchRemove(options[1]);
                } else {
                    repo.branch(options[0]);
                }
            },

            'add': function(options) {
                repo.add();
            },

            'commit': function(options) {
                repo.commit();
            },

            'checkout': function(options) {
                if ( '-b' == options[0] ) {
                    repo.branch(options[1]);
                    options[0] = options[1];
                }
                repo.switchToBranch(options[0]);
            },

            'reset': function(options) {
                var subTokens = options[0].split('~');

                if (subTokens.length > 1) {
                    repo.reset(~~subTokens[1]);
                } else {
                    repo.resetTo(subTokens[0]);
                }
            },

            'rebase': function(options) {
                repo.rebase(options[0]);
            },

            'gc': function(options) {
                repo.gc();
            },

            'ci': function(options) {
                repo.add(options[0]);
                repo.commit();
            },

            'revert': function(options) {
                repo.revert(options[0]);
            },

            'cherry-pick': function(options) {
                repo.cherryPick(options[0]);
            },

            'merge': function(options) {
                repo.merge(options);
            }
        },

        aliases = {
            'b': 'branch',
            'co': 'checkout'
        };

    function _run(commandStr) {

        if (!commandStr.indexOf('git ')) {
            var options = commandStr.substr('git '.length).split(' '),
                command = options.shift();


                if (commands[command]){
                    commands[command](options);
                } else if (aliases[command]) {
                    commands[aliases[command]](options);
                }

            return true;
        }

        return false;
    }


    return {
        run: function(commandStr) {
            commandStr.split(' && ').forEach(function(et){
                _run(et);
            })
        }
    };
}
