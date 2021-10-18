var btn_settings = document.querySelector(".settings");

btn_settings.addEventListener('click', settingsToggle1);
function settingsToggle1(e) {
    
    var x = document.querySelector('.list-1');
    
    if (!x.classList.contains('animate-settings-open') ) {
        x.classList.toggle('animate-settings-open');
        btn_settings.classList.remove("animate-btn-set-close");
        btn_settings.classList.add("animate-btn-set-open");
    }
    else if(x.classList.contains('animate-settings-open')) {
        x.classList.toggle('animate-settings-open');
        // overlay.style.display = "none";
        // overlay.style.opacity = "0";
        
        btn_settings.classList.remove("animate-btn-set-open");
        btn_settings.classList.add("animate-btn-set-close");
    }
}
