
var btn = document.querySelector('.menu');
var menu = document.querySelector('.slide-container');
btn.addEventListener('click', slide);

function slide(e) {
    if (!menu.classList.contains("slide-container-animate-left") && e.target == btn) {
        openSidebar(e);
        settingsToggle2(e);
        overlay.style.display = "block";
        overlay.style.opacity = "1";
        btn.innerHTML = "X";
        menu.classList.remove("slide-container-animate-right");
        menu.classList.add("slide-container-animate-left");
    }
    else if(menu.classList.contains("slide-container-animate-left")) {
        overlay.style.display = "none";
        overlay.style.opacity = "0";
        btn.innerHTML = "=";
        menu.classList.remove("slide-container-animate-left");
        menu.classList.add("slide-container-animate-right");
    }
}

var btn_aside = document.querySelector('.btn-aside');
btn_aside.addEventListener('click', openSidebar);
var sidebar = document.querySelector('.sidebar');
var small_aside = document.querySelector('.small-aside');


function openSidebar(e) {
    
    if (!sidebar.classList.contains("animate-sidebar-open") && e.target == btn_aside) {
        settingsToggle2(e);
        slide(e);
        overlay.style.display = "block";
        overlay.style.opacity = "1";
        // sidebar.style.display = "block";
        sidebar.classList.remove("animate-sidebar-close");
        sidebar.classList.add("animate-sidebar-open");
        btn_aside.innerHTML = "<";
    }
    else if(sidebar.classList.contains("animate-sidebar-open")){
        overlay.style.display = "none";
        overlay.style.opacity = "0";
        sidebar.classList.remove("animate-sidebar-open");
        sidebar.classList.add("animate-sidebar-close");
        btn_aside.innerHTML = ">";
    }
}



var btn_settings = document.querySelectorAll(".settings");
var btn_set1 = btn_settings[0];
var btn_set2 = btn_settings[1];
btn_set1.addEventListener('click', settingsToggle1);
btn_set2.addEventListener('click', settingsToggle2);


var overlay = document.querySelector('.overlay-container');
function settingsToggle1(e) {
    
    var x = document.querySelector('.list-1');
    
    if (!x.classList.contains('animate-settings-open') && e.target == btn_set1) {
        openSidebar(e);
        slide(e);
        overlay.style.display = "block";
        overlay.style.opacity = "1";

        // x.classList.remove('animate-settings-close');
        x.classList.toggle('animate-settings-open');
        btn_set1.classList.remove("animate-btn-set-close");
        btn_set1.classList.add("animate-btn-set-open");
    }
    else if(x.classList.contains('animate-settings-open')) {
        x.classList.toggle('animate-settings-open');
        overlay.style.display = "none";
        overlay.style.opacity = "0";
        // x.classList.add('animate-settings-close');
        btn_set1.classList.remove("animate-btn-set-open");
        btn_set1.classList.add("animate-btn-set-close");
    }
}

function settingsToggle2(e) {
    
    var x = document.querySelector('.list-2');
    
    if (!x.classList.contains('animate-settings-open') && e.target == btn_set2) {
        openSidebar(e);
        slide(e);
        overlay.style.display = "block";
        overlay.style.opacity = "1";

        // x.classList.remove('animate-settings-close');
        x.classList.toggle('animate-settings-open');
        btn_set2.classList.remove("animate-btn-set-close");
        btn_set2.classList.add("animate-btn-set-open");
    }
    else if(x.classList.contains('animate-settings-open')) {
        x.classList.toggle('animate-settings-open');
        overlay.style.display = "none";
        overlay.style.opacity = "0";
        // x.classList.add('animate-settings-close');
        btn_set2.classList.remove("animate-btn-set-open");
        btn_set2.classList.add("animate-btn-set-close");
    }
}


overlay.addEventListener('click', closeAll);


function closeAll(e){

    openSidebar(e);
    slide(e);
    settingsToggle2(e);
}