/* exported CommandLine */
function CommandLine(inputSelector, callback) {

    var history = [],
        currentPosition = history.length,
        input = document.querySelectorAll(inputSelector)[0];

    input.addEventListener('keydown', function(e) {

        switch (e.keyCode) {
            case 13:
                if (input.value !== '') {
                    (input.value !== history[history.length - 1]) && history.push(input.value);
                    input.value = '';
                    currentPosition = history.length;

                    callback();
                }
            break;

            case 38:
                (currentPosition > 0) && currentPosition--;
                input.value = history[currentPosition];
            break;

            case 40:
                (currentPosition < history.length-1) && currentPosition++;
                input.value = history[currentPosition];
            break;

            case 27:
                input.value = '';
                currentPosition = history.length;
            break;
        }

    });

    return {
        getCurrent: function() {
            return history[currentPosition - 1] || '';
        },

        append: function (val) {
            input.value = input.value + val;
            input.focus();
        }
    };

}
