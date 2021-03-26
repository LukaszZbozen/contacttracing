// Single page mobile (SPA) application navigation
function showIndexPage(){
    document.getElementById("indexPage").style.display="block";
    document.getElementById("qrCheckin").style.display="none";
    document.getElementById("manualPage").style.display="none";
    document.getElementById("reportPage").style.display="none";
    document.getElementById("aboutPage").style.display="none";
}
function qrCheckin(){
    document.getElementById("indexPage").style.display="none";
    document.getElementById("qrCheckin").style.display="block";
    document.getElementById("manualPage").style.display="none";
    document.getElementById("reportPage").style.display="none";
    document.getElementById("aboutPage").style.display="none";
}

function showManualPage(){
    document.getElementById("indexPage").style.display="none";
    document.getElementById("qrCheckin").style.display="none";
    document.getElementById("manualPage").style.display="block";
    document.getElementById("reportPage").style.display="none";
    document.getElementById("aboutPage").style.display="none";
}
function showReportPage(){
    document.getElementById("indexPage").style.display="none";
    document.getElementById("qrCheckin").style.display="none";
    document.getElementById("manualPage").style.display="none";
    document.getElementById("reportPage").style.display="block";
    document.getElementById("aboutPage").style.display="none";
}
function showAboutPage(){
    document.getElementById("indexPage").style.display="none";
    document.getElementById("qrCheckin").style.display="none";
    document.getElementById("manualPage").style.display="none";
    document.getElementById("reportPage").style.display="none";
    document.getElementById("aboutPage").style.display="block";
}