// script.js
let data = JSON.parse(localStorage.getItem("fineData")) || [];

const tableBody = document.getElementById("tableBody");

const totalFine = document.getElementById("totalFine");
const totalErrors = document.getElementById("totalErrors");
const topUser = document.getElementById("topUser");
const topFeature = document.getElementById("topFeature");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const typeFilter = document.getElementById("typeFilter");

function formatMoney(value){
  return value.toLocaleString("vi-VN") + "đ";
}

function renderTable(data = violations) {
  tableBody.innerHTML = "";

  data.forEach((item, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.employee}</td>
        <td>${item.feature}</td>
        <td>${item.errorType}</td>
        <td>${Number(item.fine).toLocaleString()}đ</td>
        <td>${item.date}</td>
        <td>
          <span class="${
            item.status === "Đã nộp" ? "paid" : "unpaid"
          }">
            ${item.status}
          </span>
        </td>

        <td>
          <button class="delete-btn" onclick="deleteViolation(${index})">
            X
          </button>
        </td>
      </tr>
    `;
  });
}

function updateStats(){

  const total = data.reduce((sum,item)=>sum + item.fine,0);

  totalFine.innerText = formatMoney(total);

  totalErrors.innerText = data.length;

  const userMap = {};
  const featureMap = {};

  data.forEach(item=>{

    userMap[item.employee] =
      (userMap[item.employee] || 0) + item.fine;

    featureMap[item.feature] =
      (featureMap[item.feature] || 0) + 1;

  });

  topUser.innerText =
    Object.keys(userMap)
      .sort((a,b)=>userMap[b]-userMap[a])[0] || "-";

  topFeature.innerText =
    Object.keys(featureMap)
      .sort((a,b)=>featureMap[b]-featureMap[a])[0] || "-";

}

function filterData(){

  const search = searchInput.value.toLowerCase();

  const status = statusFilter.value;

  const type =
  typeFilter.value.toLowerCase();

  const filtered = data.filter(item=>{

    const matchSearch =
      item.employee.toLowerCase().includes(search);

    const matchStatus =
      status === "" || item.status === status;

    const matchType =
  type === "" ||
  item.type.toLowerCase().includes(type);

    return matchSearch && matchStatus && matchType;

  });

  renderTable(filtered);

}

function deleteViolation(index) {
  if (confirm("Xóa vi phạm này?")) {
    violations.splice(index, 1);

    localStorage.setItem(
      "violations",
      JSON.stringify(violations)
    );

    renderAll();
  }
}

searchInput.addEventListener("input",filterData);
statusFilter.addEventListener("change",filterData);
typeFilter.addEventListener("change",filterData);

renderTable(data);
updateStats();

document.getElementById("currentDate").innerText =
  new Date().toLocaleDateString("vi-VN");

const modal = document.getElementById("modal");

document.getElementById("openModalBtn")
  .onclick = ()=> modal.classList.remove("hidden");

document.getElementById("closeModalBtn")
  .onclick = ()=> modal.classList.add("hidden");

document.getElementById("saveBtn").onclick = ()=>{

  const employee =
    document.getElementById("employeeInput").value;

  const feature =
    document.getElementById("featureInput").value;

  const type =
    document.getElementById("errorTypeInput").value;

  const fine =
    Number(document.getElementById("fineInput").value);

  const date =
    document.getElementById("dateInput").value;

  const status =
    document.getElementById("statusInput").value;

  if(!employee || !feature || !fine || !date){
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  data.unshift({
    employee,
    feature,
    type,
    fine,
    date,
    status
  });

  localStorage.setItem(
    "fineData",
    JSON.stringify(data)
  );

  renderTable(data);
  updateStats();
  updateCharts();

  modal.classList.add("hidden");

};

let barChart;
let pieChart;

function updateCharts(){

  const employeeMap = {};
  const typeMap = {};

  data.forEach(item=>{

    employeeMap[item.employee] =
      (employeeMap[item.employee] || 0) + item.fine;

    typeMap[item.type] =
      (typeMap[item.type] || 0) + 1;

  });

  const employeeLabels = Object.keys(employeeMap);
  const employeeValues = Object.values(employeeMap);

  const typeLabels = Object.keys(typeMap);
  const typeValues = Object.values(typeMap);

  if(barChart) barChart.destroy();
  if(pieChart) pieChart.destroy();

  barChart = new Chart(
    document.getElementById("barChart"),
    {
      type:"bar",
      data:{
        labels:employeeLabels,
        datasets:[{
          label:"Tiền phạt",
          data:employeeValues
        }]
      }
    }
  );

  pieChart = new Chart(
    document.getElementById("pieChart"),
    {
      type:"pie",
      data:{
        labels:typeLabels,
        datasets:[{
          data:typeValues
        }]
      }
    }
  );

}

updateCharts();