/* exported CommandLine */
function CommandLine(input) {

    var history = [],
        currentPosition = history.length;

    input = $(input);

    input.bind('keydown', function(e) {

        switch (e.keyCode) {
            case 13:
                if (input.val !== '') {
                     (input.val() !== history[history.length - 1]) && history.push(input.val());
                     input.val('');
                     currentPosition = history.length;

                    $('body').trigger('command-entered');
                }
            break;

            case 38:
                (currentPosition > 0) && currentPosition--;
                input.val(history[currentPosition]);
            break;

            case 40:
                (currentPosition < history.length) && currentPosition++;
                input.val(history[currentPosition]);
            break;

            case 27:
                input.val('');
                currentPosition = history.length;
            break;
        }

    });

    return {
        getCurrent: function() {
            return history[currentPosition - 1] || '';
        }
    };

}
