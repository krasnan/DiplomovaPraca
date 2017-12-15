
( function ( $ ) {

    $( document ).ready( function () {
        var outer=$('.ie__playground');
        var inner=$('.ie__playground>div');
        console.log(inner);
        outer.scrollLeft((inner[0].offsetWidth-outer[0].offsetWidth)/2 - 100);
        outer.scrollTop((inner[0].offsetHeight-outer[0].offsetHeight)/2);
    } );

}(jQuery ) );