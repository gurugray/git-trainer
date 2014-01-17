/* exported GitCommander */
function GitCommander(repo) {

    var commands = {

            branch: function(options) {
                if ( '-d' === options[0] ) {
                    repo.branchRemove(options[1]);
                } else {
                    repo.branch(options);
                }
            },

            add: function() {
                repo.add();
            },

            commit: function(options) {
                if ( '-a' === options[0] ) {
                    repo.add();
                }
                repo.commit();
            },

            checkout: function(options) {
                if ( '-b' === options[0] ) {
                    options.shift();
                    repo.branch(options);
                }
                repo.switchToBranch(options[0]);
            },

            reset: function(options) {
                var subTokens = options[0].split('~');

                if (subTokens.length > 1) {
                    repo.reset(~~subTokens[1]);
                } else {
                    repo.resetTo(subTokens[0]);
                }
            },

            rebase: function(options) {
                repo.rebase(options[0]);
            },

            gc: function() {
                repo.gc();
            },

            revert: function() {
                repo.revert();
            },

            'cherry-pick': function() {
                repo.cherryPick();
            },

            merge: function(options) {
                repo.merge(
                    _.without(options, '--no-ff'),
                    _.contains(options, '--no-ff')
                );
            }
        },

        aliases = {
            b: 'branch',
            co: 'checkout',
            ci: 'add && commit'
        };

    function _run(commandStr) {

        if (!commandStr.indexOf('git ')) {
            var options = commandStr.substr('git '.length).split(' '),
                command = options.shift();

                if (commands[command]) {
                    commands[command](options);
                } else if (aliases[command]) {
                    aliases[command].split(' && ').forEach(function(command){
                        commands[command](options);
                    });
                }

            return true;
        }

        return false;
    }

    return {
        run: function(commandStr) {
            commandStr.split(' && ').forEach(function(et) {
                _run(et);
            });
        }
    };
}
