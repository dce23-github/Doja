const form = document.querySelector(".signup");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value;
  const age = form.age.value;
  const gender = form.gender.value;
  const country = form.country.value;
  const organisation = form.organisation.value;
  const email = form.email.value;
  const password = form.password.value;
  const userHandle = form.userHandle.value;
  const confirmPassword = form.confirmPassword.value;

  const payload = {
    name,
    age,
    gender,
    country,
    organisation,
    email,
    password,
    confirmPassword,
    userHandle,
  };

  try {
    const result = await fetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await result.json();

    localStorage.setItem("user_id", data.user._id);
    localStorage.setItem("user_handle", data.user.userHandle);

    if (data.user) {
      location.assign("/");
    }
  } catch (err) {
    console.log(err);
  }
});
