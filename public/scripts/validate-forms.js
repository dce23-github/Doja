const form = document.querySelector(".form-validate");

function checkValdiity(form) {
    const elems = form.elements;
    let cond = true;
    for (let e of elems) {
        if (e.classList.contains("required") && e.value === "") {
            e.classList.add("invalid-box");
            form.classList.add("invalid-form");
            cond = false;
        }
        else if (e.classList.contains("required") && e.value !== "") {
            e.classList.remove("invalid-box");
            form.classList.remove("invalid-form");
        }
    }

    return cond;
}

// Array.from(forms).forEach(form=>{
if(form)
form.addEventListener("submit", function (e) {
    if (!checkValdiity(form)) {
        console.log("preventing default");
        e.preventDefault();
        // e.stopPropagation();
    }
});
    // });