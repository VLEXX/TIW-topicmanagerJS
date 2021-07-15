document.getElementById("loginbutton").addEventListener("click", (ev) =>{
    valandsub();
})

function valandsub() {
    var myform = document.getElementById("loginform");
    var name = myform.elements["username"];
    var pass = myform.elements["password"];
    console.log(name);
    console.log(pass);
    if(!name || name.trim().length === 0 || name.match(/^[0-9a-z ]+$/i)){
        alert("Username non valido: deve contenere almeno un carattere, massimo 256 caratteri e non sono ammessi simboli.");
        console.log("valandsub: username non valido");
        return false;
    }
    if(!pass || pass.trim().length === 0){
        alert("Password non valida: deve contenere almeno un carattere");
        console.log("valandsub: password non valida");
        return false;
    }

    var req = new XMLHttpRequest();
    var url = "localhost:8080/gruppo33js/logincheck";
    req.open("post", url, true);
    var data = new FormData();
    data.append("username",name);
    data.append("password",pass);
    req.onreadystatechange = resulthandler;
    req.send(data);


}

function resulthandler(){
    if(req.readyState === 4){
        if(req.status === 401)
            alert("Accesso negato: le credenziali non sono corrette");
        else if(req.status === 200){
            var adv = document.getElementById("warning");
            var text = document.createtextnode("Loggato con successo, attendi qualche secondo per essere rediretto alla home");
            adv.appendChild(text);
            window.setTimeout(redirect,3000);
        }

    }
}

function redirect(){
    window.location.href = "localhost:8080/gruppo33js/areapersonale/home";
}

