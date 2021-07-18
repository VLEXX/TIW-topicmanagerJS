window.onload = initialise;

function initialise() {
    var uname = localStorage.getItem("loggedusername");
    if(!uname)
        uname = "utente";
    document.getElementById("loggedusername").innerHTML = utente;
    loadtree();
    
    
}

function loadtree() {
var req = new XMLHttpRequest();
var url = "http://localhost:8080/gruppo33js/areapersonale/TreeSupplier";
req.onreadystatechange = function () {
    resultmanager(req);};
req.open("GET", url, true);
req.send();
}

//todo implementare funzione resultmanager per costruire l'albero e una funzione che costruisca l'albero
function resultmanager(req){
    var adv = document.getElementById("warning");
    if(req.readyState === 4) {
        if (req.status === 400 || req.status === 500) {
            adv.innerHTML = "<span style='color:red'>Errore durante il processamento della richiesta, riprovare piu' tardi</span>";
        }
    }
}