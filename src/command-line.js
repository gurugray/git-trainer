/* exported CommandLine */
/* global Mousetrap */

function CommandLine(inputSelector, callback) {

    function History(input) {
        var commands = [],
            current = 0;

        return {

            prev: function() {
                if (current > 0) {
                    current--;
                    this.update();
                }
            },

            update: function() { // update current state in input
                input.value = commands[current];
            },

            next: function() {
                if (current < commands.length - 1) {
                    current++;
                    this.update();
                }
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

    var input = document.querySelector(inputSelector),
        history = new History(input);

        Mousetrap.bind('enter', function() {
            history.push(input.value);

            callback(history.current());
            return false;
        });

        Mousetrap.bind('up', history.prev.bind(history));
        Mousetrap.bind('down', history.next.bind(history));
        Mousetrap.bind('ctrl+c', history.clearCurrent.bind(history));

    return {
        append: function (val) {
            input.value = input.value + val;
            input.focus();
        }
    };

}
