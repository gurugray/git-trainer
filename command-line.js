function CommandLine(input) {
    var history = [],
        currentPosition = history.length,
        input = $(input);

    input.bind('keydown', function(e) {
        if (e.keyCode == 13 && input.val() != '') {
            (input.val() != history[history.length-1]) && history.push(input.val());
            input.val('');
            currentPosition = history.length;

           $('body').trigger('command-entered');
        } else if (e.keyCode == 38) {
            (currentPosition > 0) && currentPosition--;
            input.val(history[currentPosition]);
        } else if (e.keyCode == 40){
            (currentPosition < history.length) && currentPosition++;
            input.val(history[currentPosition]);
        } else if (e.keyCode == 27) {
            input.val('');
            currentPosition = history.length;
        }
    });

    return {
        getCurrent: function(){
            return history[currentPosition-1] ? history[currentPosition-1] : '';
        }
    }
}