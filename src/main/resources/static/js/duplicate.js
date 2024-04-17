$(document).ready(function () {
    $("#email").on("focusout", function () {

        var id = $("#email").val();

        if (id == '' || id.length == 0) {
            $("#lEmail").css("color", "red").text("공백은 ID로 사용할 수 없습니다.");
            return false;
        }

        //Ajax로 전송
        $.ajax({
            url: '/duplicate',
            data: {
                email: id
            },
            type: 'POST',
            datatype: 'json',
            success: function (result) {
                if (result == true) {
                    $("#lEmail").css("color", "black").text("사용 가능한 ID 입니다.");
                } else {
                    $("#lEmail").css("color", "red").text("사용 불가능한 ID 입니다.");
                }
            }
        }); //End Ajax
    });


})