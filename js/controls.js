//! elements
const playButton = document.getElementById("playButton");
const difficultyButtons = document.querySelectorAll(".difficulty-option");

//! event handlers

playButton.addEventListener("click", function () {
  console.log("lol");
  document.getElementById("difficultyModal").style.display = "block";
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", function () {
    //todo handling the difficultyModal !!
    document.getElementById("difficultyModal").style.display = "none";
  });
});
