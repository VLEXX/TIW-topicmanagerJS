window.onload = initialise;

function initialise() {
    var uname = localStorage.getItem("loggeduser");
    if(!uname)
        uname = "utente";
    document.getElementById("loggedusername").innerHTML = uname;
    loadtree();
    
    
}

function loadtree() {
var req = new XMLHttpRequest();
var url = "http://localhost:8080/gruppo33js/areapersonale/topics";
req.onreadystatechange = function () {
    resultmanager(req);};
req.open("GET", url, true);
req.send();
}

function resultmanager(req){
    var adv = document.getElementById("warning");
    if(req.readyState === 4) {
        if (req.status === 400 || req.status === 500) {
            adv.innerHTML = "<span style='color:red'>Errore durante il processamento della richiesta, riprovare piu' tardi</span>";
        }else if(req.status === 200){
            treebuild(req);
        }
    }
}

function treebuild(req){
    var treeobj = JSON.parse(req.responseText);
    console.log(JSON.stringify(treeobj));
    if(!treeobj || treeobj.length === 0){
        document.getElementById("warning").innerHTML = "L'elenco dei topic e' vuoto";
    }else{
        var treeloc = document.getElementById("tree");
        treeloc.innerHTML = "";
        treestruct(treeobj,treeloc,"root_node");
    }
}

function treestruct(treeobj,treeloc,sectionval){
    treeloc.innerHTML += "<section><ul id= '"+sectionval+"' class='chlist'></ul></section>";
    var l = treeobj.length;
    var treetmp = document.getElementById(sectionval);
    var innertmp;
    for (var i = 0; i < l; i++){
        treetmp.innerHTML += "<li id="+sectionval+i+" class='childrenof"+sectionval+"'><span>"+treeobj[i].treeindex+" "+treeobj[i].topic+"</span></li>";
        innertmp = document.getElementById(sectionval+i);
        treestruct(treeobj[i].childrenlist,innertmp,treeobj[i].topic);
    }
}

function addtopic(){
    document.getElementById("addresult").innerHTML = "";
    var myform = document.getElementById("addform");
    var newtop = myform.elements["topicfield"].value;
    var topfat = myform.elements["fathertopicfield"].value;
    console.log("Inseriti nel form: padre: "+topfat+", nuova cat.: "+newtop+";");
    if(topfat && document.getElementById(topfat)===null){
        document.getElementById("addresult").innerHTML = "<span style='color: red'>Categoria padre inesistente.</span>";
        return;
    }
    if(!newtop || newtop.trim() === ""){
        document.getElementById("addresult").innerHTML = "<span style='color: red'>Campo nuova categoria e' obbligatorio</span>";
        return;
    }else if(document.getElementById("newtop")){
        document.getElementById("addresult").innerHTML = "<span style='color: red'>La categoria esiste gia'.</span>";
        return;
    }
    if(!topfat || topfat.trim() === "")
        topfat = "root_node";
    if(document.getElementById(topfat).getElementsByClassName("childrenof"+topfat).length > 8){
        document.getElementById("addresult").innerHTML = "<span style='color: red'>La categoria scelta ha gia' il limite massimo di categorie figlie consentito.</span>";
        return;
    }
    if(newtop.length > 255){
        document.getElementById("addresult").innerHTML = "<span style='color: red'>La categoria inserita non puo' superare i 255 caratteri.</span>";
        return;
    }
    console.log("Fathername is equal to: "+topfat);
    var req = new XMLHttpRequest();
    var url = "http://localhost:8080/gruppo33js/areapersonale/addtopic";
    req.onreadystatechange = function(){addhandler(req, newtop,topfat);};
    req.open("POST", url, true);
    var data = new FormData();
    data.append("newtopic",newtop);
    data.append("father",topfat);
    req.send(data);
    console.log("Richiesta di add inviata");

}

function addhandler(req,newtop,topfat){
    var adv = document.getElementById("addresult");
    if(req.readyState === 4){
        if(req.status === 400 || req.status === 500){
            adv.innerHTML = req.responseText;
        } else if(req.status === 200){
            adv.innerHTML = req.responseText;
            loadtree();

        }

    }
}
//todo implememntare addhandler e servlet addtopic


function logout(){
localStorage.clear();
window.location.href = "http://localhost:8080/gruppo33js/login";
//todo implementare chiamata a servlet per pulire sessione
}