// ==========================
// DATA (EMPTY START 🔥)
// ==========================
let files = {};

// LOAD STORAGE
const saved = localStorage.getItem("files");
if (saved) files = JSON.parse(saved);

let currentFile = null;
let mode = "preview";

// ELEMENT
const editor = document.getElementById("editorInput");
const lineNumbers = document.getElementById("lineNumbers");
const fileListEl = document.getElementById("fileList");

// ==========================
// SIDEBAR
// ==========================
function renderFileList() {
  fileListEl.innerHTML = "";

  Object.keys(files).forEach(name => {
    const div = document.createElement("div");
    div.className = "file";

    const title = document.createElement("span");
    title.textContent = name + ".txt";

    const del = document.createElement("span");
    del.textContent = "❌";

    // klik seluruh row juga bisa
    div.onclick = () => openFile(name);

    del.onclick = (e) => {
      e.stopPropagation();
      deleteFile(name);
    };

    div.appendChild(title);
    div.appendChild(del);

    fileListEl.appendChild(div);
  });
}

// ==========================
// PREVIEW
// ==========================
function renderCode(text) {
  const table = document.getElementById("codeTable");
  table.innerHTML = "";

  text.split("\n").forEach((line, i) => {
    const row = document.createElement("tr");

    const num = document.createElement("td");
    num.className = "line";
    num.textContent = i + 1;

    const code = document.createElement("td");
    code.className = "code";
    code.textContent = line;

    row.appendChild(num);
    row.appendChild(code);
    table.appendChild(row);
  });
}

// ==========================
// LINE NUMBER
// ==========================
function updateLineNumbers() {
  const count = editor.value.split("\n").length;
  let html = "";

  for (let i = 1; i <= count; i++) {
    html += i + "<br>";
  }

  lineNumbers.innerHTML = html;
}

// ==========================
// SCROLL SYNC
// ==========================
editor.addEventListener("scroll", () => {
  lineNumbers.scrollTop = editor.scrollTop;
});

// ==========================
// AUTO SAVE
// ==========================
editor.addEventListener("input", () => {
  if (!currentFile) return;

  files[currentFile] = editor.value;
  localStorage.setItem("files", JSON.stringify(files));

  updateLineNumbers();
});

// ==========================
// OPEN FILE
// ==========================
function openFile(name) {
  if (!(name in files)) return;

  currentFile = name;

  document.getElementById("fileName").textContent = name + ".txt";

  editor.value = files[name] || "";

  updateLineNumbers();
  renderCode(files[name] || "");
}

// ==========================
// MODE
// ==========================
function setMode(newMode) {
  mode = newMode;

  document.getElementById("previewBtn").classList.remove("active");
  document.getElementById("editBtn").classList.remove("active");
  document.getElementById(newMode + "Btn").classList.add("active");

  if (mode === "edit") {
    document.getElementById("editorContainer").classList.remove("hidden");
    document.getElementById("preview").classList.add("hidden");
  } else {
    document.getElementById("editorContainer").classList.add("hidden");
    document.getElementById("preview").classList.remove("hidden");

    if (currentFile) renderCode(files[currentFile]);
  }
}

// ==========================
// ADD FILE
// ==========================
function addFile() {
  let name = prompt("Nama file?");
  if (!name) return;

  if (files[name]) {
    alert("File sudah ada!");
    return;
  }

  files[name] = "";

  localStorage.setItem("files", JSON.stringify(files));

  currentFile = name;

  renderFileList();
  openFile(name);

  setMode("edit");
}

// ==========================
// DELETE FILE
// ==========================
function deleteFile(name) {
  if (!confirm("Hapus file?")) return;

  delete files[name];

  const keys = Object.keys(files);
  currentFile = keys.length ? keys[0] : null;

  localStorage.setItem("files", JSON.stringify(files));

  renderFileList();

  if (currentFile) {
    openFile(currentFile);
  } else {
    document.getElementById("fileName").textContent = "No file selected";
    document.getElementById("codeTable").innerHTML = "";
    editor.value = "";
  }
}

// ==========================
// COPY
// ==========================
function copyText() {
  if (!currentFile) return;
  navigator.clipboard.writeText(files[currentFile]);
}

// ==========================
// DOWNLOAD
// ==========================
function downloadFile() {
  if (!currentFile) return;

  const blob = new Blob([files[currentFile]]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentFile + ".txt";
  a.click();
}

// ==========================
// CTRL+A PREVIEW
// ==========================
document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "a") {
    if (mode === "preview") {
      e.preventDefault();

      let range = document.createRange();
      range.selectNodeContents(document.getElementById("preview"));

      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
});

document.addEventListener("copy", function(e){
  if(mode === "preview" && currentFile){
    e.preventDefault();

    // ambil teks asli (bukan dari DOM)
    const text = files[currentFile] || "";

    e.clipboardData.setData("text/plain", text);
  }
});

// ==========================
// INIT
// ==========================
renderFileList();

if (Object.keys(files).length > 0) {
  currentFile = Object.keys(files)[0];
  openFile(currentFile);
} else {
  document.getElementById("fileName").textContent = "No file selected";
}