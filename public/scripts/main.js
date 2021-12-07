var btn_settings = document.querySelector(".settings");

btn_settings.addEventListener('click', settingsToggle1);
function settingsToggle1(e) {

    var x = document.querySelector('.list-1');
    const img = document.querySelector(".menu-img");

    if (!x.classList.contains('animate-settings-open')) {
        img.setAttribute("src", "/images/menu-close1.png");
        x.classList.toggle('animate-settings-open');
        btn_settings.classList.remove("animate-btn-set-close");
        btn_settings.classList.add("animate-btn-set-open");

    }
    else if (x.classList.contains('animate-settings-open')) {
        x.classList.toggle('animate-settings-open');
        // overlay.style.display = "none";
        // overlay.style.opacity = "0";
        btn_settings.classList.remove("animate-btn-set-open");
        btn_settings.classList.add("animate-btn-set-close");
        img.setAttribute("src", "/images/menu.png");
    }
}



async function getNotif(event) {

    const flashNotif = document.querySelector(".flash-notif");
    const notif = document.querySelector(".notif-content");
    flashNotif.style.display = "block";
    const img = document.createElement("img");
    img.setAttribute("src", "/images/close1.png");
    img.classList.add("closeNotif");
    img.setAttribute("onclick", "closeNotif(event)");
    notif.appendChild(img);
    
    const res = await fetch(`/notifications/${userId}`);
    const user = await res.json();

    if (user.friendRequests.length == 0 && user.teamInvites.length == 0) {
        const h2 = document.createElement("h2");
        h2.style.textAlign = "center";
        h2.classList.add("headNotif");
        h2.textContent = "No Notifications!!";
        notif.appendChild(h2);
    }
    else {
        const h2 = document.createElement("h2");
        h2.classList.add("headNotif");
        h2.textContent = "Notifications";
        notif.appendChild(h2);
        for (let freq of user.friendRequests) {
            const div = document.createElement("div");
            div.classList.add("rowNotif");
            const p = document.createElement("p");
            p.textContent = "Friend Request -";
            p.classList.add("notifTitle");
            const p2 = document.createElement("p");
            p2.textContent = freq.name + "@" + freq.userHandle;
            div.appendChild(p);
            div.appendChild(p2);
            notif.appendChild(div);
        }

        for (let team of user.teamInvites) {
            const div = document.createElement("rowNotif");
            const p = document.createElement("p");
            p.textContent = "Team Invite -";
            p.classList.add("notifTitlr");
            const p2 = document.createElement("p");
            p2.textContent = "Team Name : " + team.name;
            const p3 = document.createElement("p");
            p3.textContent = "From : " + team.members[0];
            div.appendChild(p);
            div.appendChild(p2);
            div.appendChild(p3);
            notif.appendChild(div);
        }
    }
}


function closeNotif(event) {
    const flashNotif = document.querySelector(".flash-notif");
    const notif = document.querySelector(".notif-content");
    notif.innerHTML = "";
    flashNotif.style.display = "none";
}