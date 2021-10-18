const signupBox = document.querySelector(".signup-render");
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

    if (signupBox.classList.contains("disp-block")) {
        signupBox.classList.remove("disp-block");
        signupBox.classList.add("disp-none");
    }
}

function signupRender() {
    if (signupBox.classList.contains("disp-none")) {
        signupBox.classList.remove("disp-none");
        signupBox.classList.add("disp-block");
    }
    else {
        signupBox.classList.add("disp-none");
        signupBox.classList.remove("disp-block");
    }

    if (loginBox.classList.contains("disp-block")) {
        loginBox.classList.remove("disp-block");
        loginBox.classList.add("disp-none");
    }
}


const login = document.querySelector(".login-form");
const signup = document.querySelector(".signup");
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
    
    // console.log(url);
    // if(!form.classList.contains("invalid-form"))
    //     form.submit();
});


if(signup)
signup.addEventListener("submit", (e) => {
    const form = e.target;
    if (!form.classList.contains("invalid-form")) {
        // e.preventDefault;
        const input = document.createElement("input");
        input.setAttribute("type", "hidden");
        const url = window.location.pathname;
        input.setAttribute("name", "url");
        input.setAttribute("value", url);
        form.appendChild(input);
    }
    // console.log(url);
    // if(!form.classList.contains("invalid-form"))
    //     form.submit();
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


