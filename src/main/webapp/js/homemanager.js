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
        var treereset = treeloc.children.length;
        if(treereset > 1)
            treeloc.removeChild(treeloc.children[1]);
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

function addtopic() {
    document.getElementById("add_result").innerHTML = "";
    var myform = document.getElementById("add_form");
    var newtop = myform.elements["topicfield_"].value;
    var topfat = myform.elements["fathertopicfield_"].value;
    console.log("Inseriti nel form: padre: " + topfat + ", nuova cat.: " + newtop + ";");
    if (topfat && document.getElementById(topfat) === null) {
        document.getElementById("add_result").innerHTML = "<span style='color: red'>Categoria padre inesistente.</span>";
        return;
    }
    if (!newtop || newtop.trim() === "") {
        document.getElementById("add_result").innerHTML = "<span style='color: red'>Campo nuova categoria e' obbligatorio</span>";
        return;
    } else if (document.getElementById(newtop)) {
        document.getElementById("add_result").innerHTML = "<span style='color: red'>La categoria esiste gia'.</span>";
        return;
    }
    if (!topfat || topfat.trim() === "")
        topfat = "root_node";
    if (document.getElementById(topfat).getElementsByClassName("childrenof" + topfat + "_").length > 8) {
        document.getElementById("add_result").innerHTML = "<span style='color: red'>La categoria scelta ha gia' il limite massimo di categorie figlie consentito.</span>";
        return;
    }
    if (newtop.length > 255) {
        document.getElementById("add_result").innerHTML = "<span style='color: red'>La categoria inserita non puo' superare i 255 caratteri.</span>";
        return;
    }
    var moves = JSON.parse(localStorage.getItem("savedmoves")).length;
    if (moves > 0) {
        var dec = postconfirm("Gli spostamenti non confermati saranno notificati al server prima che la nuova categoria sia aggiunta, e in caso essi non siano validi la nuova categoria verrà inserita come sottocategoria nella categoria padre specificata ove possibile. Continuare?");
        if (dec === true) {
            sendmoves(true,newtop,topfat);
        }
    }else
        addsend(newtop,topfat);
}

function addsend(newtop,topfat){
    console.log("Fathername is equal to: "+topfat);
    var req = new XMLHttpRequest();
    var url = "http://localhost:8080/gruppo33js/areapersonale/addtopic";
    req.onreadystatechange = function(){addhandler(req);};
    req.open("POST", url, true);
    var data = new FormData();
    data.append("newtopic",newtop);
    data.append("father",topfat);
    req.send(data);
    console.log("Richiesta di add inviata");

}

function addhandler(req){
    var adv = document.getElementById("add_result");
    if(req.readyState === 4){
        if(req.status === 400 || req.status === 500){
            adv.innerHTML = req.responseText;
        } else if(req.status === 200){
            adv.innerHTML = req.responseText;
            loadtree();

        }
        setTimeout(function(){adv.innerHTML="";},4000);

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
        },4000);
        return;
    }

    var datat = event.dataTransfer.getData("text");
    var oldfatherid = document.getElementById(datat).parentElement.id;
    if(!document.getElementById(datat)){
        console.log("La categoria da spostare non esiste");
        return;
    }
    var exito = postconfirm("Confermi lo spostamento ?");
    if(exito === false)
        return;
    realtarget.appendChild(document.getElementById(datat));
    var mem = JSON.parse(localStorage.getItem("savedmoves"));
    document.getElementById("movesubmitter").style.display = "block";

    mem.push({src : document.getElementById(datat).children[0].id, dest : destination });
    console.log("Salvato spostamento di "+ document.getElementById(datat).children[0].id + " in "+destination+".");
    localStorage.setItem("savedmoves", JSON.stringify(mem));
    document.getElementById(datat).className = "childrenof"+realtarget.id;
    var destindexinit;
    var fatherindexinit;
    console.log("Id vecchio padre (ul): "+oldfatherid+", id nuovo padre (ul): "+realtarget.id);
    if(oldfatherid === "root_node")
        fatherindexinit = "";
    else
        fatherindexinit = document.getElementById(oldfatherid).parentNode.parentNode.children[0].children[0].innerHTML;
    if(realtarget.id === "root_node")
        destindexinit = "";
    else
        destindexinit = document.getElementById(realtarget.id).parentNode.parentNode.children[0].children[0].innerHTML;

    indexrebuild(oldfatherid, fatherindexinit);
    if(oldfatherid !== realtarget.id)
        indexrebuild(realtarget.id, destindexinit);

}

//start from contiene l'id della sezione ul
function indexrebuild(startfrom,initnumber){
    var chil = document.getElementById(startfrom).children;
    for(var j = 0; j< chil.length; j++ ){
        var xx = +j+1;
        var xxn = ""+initnumber+xx;
        chil[j].children[0].children[0].innerHTML = xxn;
        indexrebuild(chil[j].children[1].children[0].id,xxn);

    }
}

function sendmoves(fadd,newtop,topfat){
    document.getElementById("movesubmitter").style.display = "none";
    var req = new XMLHttpRequest();
    var moves = localStorage.getItem("savedmoves");
    if(JSON.parse(moves).length === 0){
        document.getElementById("warning_").innerHTML = "<span style='color: red'>Non ci sono spostamenti da notificare.</span>";
        return;
    }
    var url = "http://localhost:8080/gruppo33js/areapersonale/movetopic";
    req.onreadystatechange = function(){movehandler(req,fadd,newtop,topfat);};
    req.open("POST", url, true);
    var data = new FormData();
    data.append("moves", moves);
    req.send(data);
    console.log("Richiesta di move inviata");

}

function movehandler(req,fadd,newtop,topfat){
    var adv = document.getElementById("warning_");
    if(req.readyState === 4){
        if(req.status === 400 || req.status === 500){
            adv.style.color = "red";
            adv.innerHTML = "req.responseText";
            if(req.status === 400){
                adv.innerHTML += "\nL'albero verra' ricaricato";
                loadtree();
            }
            setTimeout(function(){adv.innerHTML = ""; adv.style.color="";}, 4000);
            if(fadd === true){
                var dec2 = postconfirm("Non è stato possibile eseguire gli spostamenti, si desidera inserire comunque la nuova categoria)");
                if(dec2 === true)
                    addsend(newtop,topfat);
            }

        } else if(req.status === 200){
            adv.style.color = "green";
            adv.innerHTML = req.responseText;
            setTimeout(function(){adv.innerHTML =""; adv.style.color="";},4000);
            loadtree();
            if(fadd === true)
                addsend(newtop,topfat);

        }
        localStorage.setItem("savedmoves","[]");


    }
}

function postconfirm(message){
    return confirm(message);
}

function logout(){
localStorage.clear();
window.location.href = "http://localhost:8080/gruppo33js/logout";
}