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

    function _recalculate() {
        var minSize = 6,
            current = this.value.length;

        this.size = (current > minSize) ? current : minSize;
    }

    var input = document.querySelector(inputSelector),
        history = new History(input);

        input.addEventListener('keydown', _recalculate);
        input.addEventListener('keyup', _recalculate);

        Mousetrap.bind('enter', function() {
            if (input.value !== '') {
                history.push(input.value);
                callback(history.current());
            } else {
                input.style.display = 'block';
                input.focus();
            }
        });

        Mousetrap.bind('up', function() {
            input.style.display = 'block';
            history.prev();
        });

        Mousetrap.bind('down', function() {
            input.style.display = 'block';
            history.next();
        });

        Mousetrap.bind('esc', function() {
            input.style.display = 'none';
            history.clearCurrent();
        });

        Mousetrap.bind('ctrl+c', history.clearCurrent.bind(history));

    return {
        append: function (val) {
            input.value = input.value + val;
            input.focus();
        }
    };

}
