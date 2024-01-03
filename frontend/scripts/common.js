export function initDetailDiv(place, okFunction) {
  place.innerHTML = "";

  const okButton = document.createElement("img");
  place.appendChild(okButton);
  okButton.src = "/styles/static/ok.svg";
  okButton.className = "ok_btn";
  okButton.addEventListener("click", function () {
    okFunction(place);
  });

  const cancelButton = document.createElement("img");
  place.appendChild(cancelButton);
  cancelButton.src = "/styles/static/x.svg";
  cancelButton.className = "cancel_btn";
  cancelButton.addEventListener("click", function () {
    place.innerHTML = "";
  });
}
