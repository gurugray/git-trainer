/* exported CommandLine */
function CommandLine(inputSelector, callback) {
    var keyCodes = {
        13: 'enter',
        38: 'up',
        40: 'down',
        27: 'esc'
    };

    function History(input) {
        var commands = [],
            current = 0;

        return {

            prev: function() {
                (current > 0) && current--;
                this.update();
            },

            update: function() { // update current state in input
                input.value = commands[current];
            },

            next: function() {
                (current < commands.length-1) && current++;
                this.update();
            },
            current: function() {
                return commands[current - 1];
            },

            clearCurrent: function() {
                input.value = '';
                current = commands.length;
            },

            push: function(command) {
                if (!command) return;
                (command !== commands[commands.length - 1]) && commands.push(command);
                this.clearCurrent();
            }

        };
    }

    var input = document.querySelectorAll(inputSelector)[0],
        history = new History(input);

    input.addEventListener('keydown', function(e) {
        var bindings = {

                enter: function() {
                    history.push(input.value);
                    callback(history.current());
                },

                up: history.prev.bind(history),
                down: history.next.bind(history),
                esc: history.clearCurrent.bind(history)
            },
            command = bindings[keyCodes[e.keyCode]];

        if (command) command();
    });

    return {
        append: function (val) {
            input.value = input.value + val;
            input.focus();
        }
    };

}
