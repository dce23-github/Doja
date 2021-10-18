const loginBox = document.querySelector(".login-render");
function loginRender() {
    if (loginBox.classList.contains("disp-none")) {
        loginBox.classList.remove("disp-none");
        loginBox.classList.add("disp-block");
    }
    else {
        loginBox.classList.add("disp-none");
        loginBox.classList.remove("disp-block");
    }
}



const login = document.querySelector(".login-form");
// const logout = document.querySelector(".logout");

if(login)
login.addEventListener("submit", (e) => {
    const form = e.target;
    if (!form.classList.contains("invalid-form")) {
        e.preventDefault;
        console.log(window.location.pathname);
        const input = document.createElement("input");
        input.setAttribute("type", "hidden");
        const url = window.location.pathname;
        input.setAttribute("name", "url");
        input.setAttribute("value", url);
        form.appendChild(input);
    }
    
});


// if(logout)
// logout.addEventListener("click", (e) => {
//     const form = e.target;
//     // e.preventDefault;
//     const input = document.createElement("input");
//     input.setAttribute("type", "hidden");
//     const url = window.location.pathname;
//     input.setAttribute("name", "url");
//     input.setAttribute("value", url);
//     form.appendChild(input);
// });


