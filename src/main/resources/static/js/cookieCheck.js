$(document).ready(function () {

        var cookie = document.cookie;

        if(cookie != undefined && cookie != "") {

            var  userId = cookie.split("cookie=")[1];
            document.querySelector("input[name='cookie']").checked = true;
            document.querySelector("input[name='email']").value = userId;
        };
})