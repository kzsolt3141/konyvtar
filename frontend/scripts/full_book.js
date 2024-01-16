const bid = document.getElementById("bid").getAttribute("content");
console.log("generate the full list based on:" + bid);

await fillBookPage();

async function fillBookPage() {
  const book = await getBookById(bid);
  const bookNotes = await getBookNotesById(bid);
  const loan = await getLoanById(bid);

  //TODO: fill the HTML with data
}

async function getBookById(bid) {
  const rsp = await fetch(`/book/find/id=${bid}`, {
    method: "GET",
  });
  const book = await rsp.json();
  return book;
}

async function getBookNotesById(bid) {
  const rsp = await fetch(`/book/find/nid=${bid}`, {
    method: "GET",
  });
  const bookNotes = await rsp.json();

  return bookNotes;
}

async function getLoanById(uid) {
  const rsp = await fetch(`/loan/bid=${uid}`, {
    method: "GET",
  });
  const loan = await rsp.json();

  return loan;
}
