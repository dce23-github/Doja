const form = document.querySelector(".login-form");

form.addEventListener("submit", async(e) => {
  e.preventDefault();

  const username = form.username.value;
  const password = form.password.value;

  const payload = {
    username,
    password,
  };

  try {
    const result = await fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    
    const data = await result.json();
    console.log(data);
    localStorage.setItem("user_id", data.user._id);
    localStorage.setItem("user_handle", data.user.userHandle);

    if (data.user) {
      location.assign("/");
    }
  } catch (err) {
    console.log(err);
  }
});
