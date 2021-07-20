window.onload = initialise;

function initialise() {
    var uname = localStorage.getItem("loggeduser");
    if(!uname)
        uname = "utente";
    document.getElementById("loggedusername").innerHTML = uname;
    var savedmoves = [];
    localStorage.setItem("savedmoves",JSON.stringify(savedmoves));
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
    var adv = document.getElementById("warning_");
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
        document.getElementById("warning_").innerHTML = "L'elenco dei topic e' vuoto";
    }else{
        var treeloc = document.getElementById("tree");
        treeloc.innerHTML;
        treestruct(treeobj,treeloc,"root_node");
    }
}

function treestruct(treeobj,treeloc,sectionval){
    treeloc.innerHTML += "<section><ul id= '"+sectionval+"' class='chlist'></ul></section>";
    var l = treeobj.length;
    var treetmp = document.getElementById(sectionval);
    var innertmp;
    for (var i = 0; i < l; i++){
        treetmp.innerHTML += "<li id='"+treeobj[i].topic+"container_' class='childrenof"+sectionval+"'  ><span id='"+treeobj[i].topic+"name_' class='dropzone' draggable='true' ondragstart='drag(event)' ondragover='dragoman(event)' ondragenter='dragen(event)' ondragleave='dragex(event)' ondrop='drope(event)'><span class='treeindex'>"+treeobj[i].treeindex+"</span> "+treeobj[i].topic+"</span></li>";
        innertmp = document.getElementById(treeobj[i].topic+"container_");
        treestruct(treeobj[i].childrenlist,innertmp,treeobj[i].topic);
    }
}

function addtopic(){
    document.getElementById("add_result").innerHTML = "";
    var myform = document.getElementById("add_form");
    var newtop = myform.elements["topicfield_"].value;
    var topfat = myform.elements["fathertopicfield_"].value;
    console.log("Inseriti nel form: padre: "+topfat+", nuova cat.: "+newtop+";");
    if(topfat && document.getElementById(topfat)===null){
        document.getElementById("add_result").innerHTML = "<span style='color: red'>Categoria padre inesistente.</span>";
        return;
    }
    if(!newtop || newtop.trim() === ""){
        document.getElementById("add_result").innerHTML = "<span style='color: red'>Campo nuova categoria e' obbligatorio</span>";
        return;
    }else if(document.getElementById(newtop)){
        document.getElementById("add_result").innerHTML = "<span style='color: red'>La categoria esiste gia'.</span>";
        return;
    }
    if(!topfat || topfat.trim() === "")
        topfat = "root_node";
    if(document.getElementById(topfat).getElementsByClassName("childrenof"+topfat+"_").length > 8){
        document.getElementById("add_result").innerHTML = "<span style='color: red'>La categoria scelta ha gia' il limite massimo di categorie figlie consentito.</span>";
        return;
    }
    if(newtop.length > 255){
        document.getElementById("add_result").innerHTML = "<span style='color: red'>La categoria inserita non puo' superare i 255 caratteri.</span>";
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
    var adv = document.getElementById("add_result");
    if(req.readyState === 4){
        if(req.status === 400 || req.status === 500){
            adv.innerHTML = req.responseText;
        } else if(req.status === 200){
            adv.innerHTML = req.responseText;
            loadtree();

        }

    }
}

function drag(event){
    console.log("Drag start");
    event.dataTransfer.setData("text",event.target.parentNode.id);
    document.getElementById("root_dropper").style.display = "block";
}

function dragoman(event){
    event.preventDefault();
}

function dragen(event){
    event.target.style.color = "purple";
}

function dragex(event){
    event.target.style.color = "";
}

function drope(event){
    console.log("Oggetto droppato");
    event.preventDefault();
    event.target.style.color = "";
    document.getElementById("root_dropper").style.display = "none";
    var realtarget = event.target.parentNode.children[1].children[0];
    var destination;
    if(event.target.id === "root_dropper") {
        destination = null;
    }
    else {
        destination = event.target.id;
    }

    if(realtarget.children.length >8){
        document.getElementById("warning_").innerHTML = "<span style='color: red'>la categoria scelta contiene gia' 9 figli";
        window.setTimeout(function () {
            document.getElementById("warning_").innerHTML = "";
        },2000);
        return;
    }
    var datat = event.dataTransfer.getData("text");
    var oldfatherid = document.getElementById(datat).parentElement.id;
    if(!document.getElementById(datat)){
        console.log("La categoria da spostare non esiste");
        return;
    }
    realtarget.appendChild(document.getElementById(datat));
    var mem = JSON.parse(localStorage.getItem("savedmoves"));

    mem.push({src : document.getElementById(datat).children[0].id, dest : destination });
    console.log("Salvato spostamento di "+ document.getElementById(datat).children[0].id + "in "+destination+".");
    localStorage.setItem("savedmoves", JSON.stringify(mem));
    document.getElementById(datat).className = "childrenof"+realtarget.id;
    indexrebuild(oldfatherid);
    indexrebuild(realtarget.id);

}

//start from contiene l'id della sezione ul
//todo implementare funzione che aggiorna indici
function indexrebuild(startfrom,initnumber){
    var chi = document.getElementById(startfrom).children;
}


function logout(){
localStorage.clear();
window.location.href = "http://localhost:8080/gruppo33js/logout";
}