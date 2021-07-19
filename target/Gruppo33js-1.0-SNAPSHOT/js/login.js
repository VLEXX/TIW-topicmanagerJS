

function valandsub() {
    var myform = document.getElementById("loginform");
    var name = myform.elements["username"].value;
    var pass = myform.elements["password"].value;
    console.log(name);
    console.log(pass);
    if(!name || name.trim().length === 0 || !name.match(/^[0-9a-z ]+$/i)){
        document.getElementById("warning").innerHTML = "<span style='color: red'>Username non valido: deve contenere almeno un carattere, massimo 256 caratteri e non sono ammessi simboli.</span>";
        console.log("valandsub: username non valido");
        return false;
    } else if(!pass || pass.trim().length === 0){
        document.getElementById("warning").innerHTML = "<span style='color: red'>Password non valida: deve contenere almeno un carattere</span>";
        console.log("valandsub: password non valida");
        return false;
    }

    var req = new XMLHttpRequest();
    var url = "http://localhost:8080/gruppo33js/logincheck";
    req.onreadystatechange = function(){resulthandler(req, name);};
    req.open("POST", url, true);
    var data = new FormData();
    data.append("username",name);
    data.append("password",pass);
    req.send(data);


}

function resulthandler(req, name){
    var adv = document.getElementById("warning");
    if(req.readyState === 4){
        if(req.status === 400 || req.status === 500){
            adv.innerHTML = "<span style='color:red'>"+req.responseText+"</span>";
        } else if(req.status === 200){
            adv.innerHTML = "<span style='color: green'> Loggato con successo, attendi qualche secondo per essere rediretto alla home</span>";
            localStorage.setItem("loggeduser",name);
            window.setTimeout(redirect,3000);
        }

    }
}

function redirect(){
    window.location.href = "http://localhost:8080/gruppo33js/areapersonale/home";
}

