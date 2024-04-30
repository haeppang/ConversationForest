$(document).ready(function () {

        var cookie = document.cookie;

        // 체크 박스 체크 된 경우 (
        if(cookie != undefined && cookie != "") {

            var  userId = cookie.split("cookie"+"=")[1];
            // 아이디 저장 체크박스에 체크 해두기
            document.querySelector("input[name='cookie']").checked = true;
            document.querySelector("input[name='email']").value = userId;
        };

});