//! elements
const playButton = document.getElementById("playButton");
const difficultyButtons = document.querySelectorAll(".difficulty-option");
const rulesBtn = document.querySelector("#rulesBtn");
const rulesModal = document.getElementById("rules");
const closeRules = document.getElementById("closeRules");
const prevRule = document.getElementById("prevRule");
const nextRule = document.getElementById("nextRule");
const ruleElements = document.querySelectorAll(".rule");

let mode = 1;
//! event handlers
playButton.addEventListener("click", function () {
  document.getElementById("difficultyModal").style.display = "flex";
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", function () {
    mode = button.dataset.id;
    document.getElementById("difficultyModal").style.display = "none";
  });
});
prevRule.addEventListener("click", () => {
  if (currentRuleIndex > 0) {
    currentRuleIndex--;
    showRule(currentRuleIndex);
  }
});
nextRule.addEventListener("click", () => {
  if (currentRuleIndex < ruleElements.length - 1) {
    currentRuleIndex++;
    showRule(currentRuleIndex);
  }
});
closeRules.addEventListener("click", () => {
  rulesModal.style.display = "none";
});

rulesBtn.addEventListener("click", () => {
  rulesModal.style.display = "flex";
});
let currentRuleIndex = 0;

function showRule(index) {
  ruleElements.forEach((rule, i) => {
    rule.classList.toggle("active", i === index);
  });
}
showRule(currentRuleIndex);
