$(document).ready(function() {
    var models = {
        1218: { 'Golf': 2589, 'Passat': 2594 },
        1220: { '2115': 2639, 'Priora': 2648, 'Нива': 2641 },
        1177: { 'Focus': 1865 },
        1199: { 'Lancer': 2194 }
    };

    $(".selectMark").change(function() {
        var selectMark = $('.selectMark option:selected').val().split('_')[0];
        var paramName = $('.selectMark option:selected').val().split('_')[1];
        console.log(models[selectMark]);
        $('.selectModel').empty();
        $('.selectModel').attr('name', 'params[' + paramName + ']');
        for (var item in models[selectMark]) {
            console.log(item);
            $('.selectModel').append(
                $('<option></option>').val(models[selectMark][item]).html(item)
            );
        }
    })
})