/* exported CommandLine */
function CommandLine(inputSelector, callback) {

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

        switch (e.keyCode) {
            case 13: // enter
                history.push(input.value);
                callback(history.current());
            break;

            case 38: history.prev(); break; // top arrow

            case 40: history.next(); break; // bottom arrow

            case 27: history.clearCurrent(); break; //esc
        }

    });

    return {
        append: function (val) {
            input.value = input.value + val;
            input.focus();
        }
    };

}
