const dateSort = document.getElementById("date-sort");
const tableTitle = document.getElementById("table-title");
const errorMsg = document.getElementById("error-msg");
const loader = document.getElementById("loader");
const table = document.getElementById("table");
const pieChartBtn = document.getElementById("pie-chart-icon");
const tableContainer = document.getElementById("table-container");
const pieChartContainer = document.getElementById("chart-container");
const ctx = document.getElementById("myChart");

//Chart.js settings
let config = {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [
      {
        label: "Percentage",
        data: [],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      labels: {
        render: function (args) {
          // args will be something like:
          // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
          return args.value + "%";
          // return object if it is image
          // return { src: 'image.png', width: 16, height: 16 };
        },
        fontSize: 14,
        fontStyle: "bold",
      },
      title: {
        display: false,
        text: "Percentages",
      },
    },
  },
};

pieChartBtn.addEventListener("click", display);

function display() {
  pieChartBtn.classList.toggle("active");
  if (
    tableContainer.style.display === "" ||
    pieChartContainer.style.display === ""
  ) {
    tableContainer.style.display = "none";
    pieChartContainer.style.display = "block";
  } else if (
    tableContainer.style.display === "block" ||
    pieChartContainer.style.display === "none"
  ) {
    tableContainer.style.display = "none";
    pieChartContainer.style.display = "block";
  } else {
    tableContainer.style.display = "block";
    pieChartContainer.style.display = "none";
  }
}

//Helper functions
function showLoader() {
  loader.classList.add("show");
  table.style.display = "none";
}

function hideLoader() {
  loader.classList.remove("show");
  table.style.display = "block";
}
const tableMaker = data => {
  let placeholder = document.querySelector("#data-output");
  let out = "";

  data.forEach(element => {
    out += `
      <tr>
      <th>
      ${new Date(element.date).toLocaleDateString("en-GB")}
      </th>
      <th>
      ${element.name}
      </th>
      <th>
      ${element.sector_id}
      </th>
      </tr>`;
  });

  placeholder.innerHTML = out;
};

const loadData = async () => {
  try {
    showLoader();
    const url = `https://sector-api-7ih3.onrender.com/api/sectors`;
    const res = await fetch(url);
    console.log(res.ok);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    hideLoader();
    return data.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (err) {
    hideLoader();
    console.log(`Error -> ${err}`);
    errorMsg.innerHTML = `${err}`;
    tableTitle.style.display = "none";
    errorMsg.style.display = "block";
  }
};

(async () => {
  const data = await loadData();
  const totalItems = data.length;

  const sectorsList = data.map(element => element.name);
  const uniqueSectorsList = [...new Set(sectorsList)];

  uniqueSectorsList.forEach(currSector => {
    const numItems = sectorsList.filter(sector => sector === currSector);
    console.log(numItems.length);

    let percentages = parseFloat((numItems.length * 100) / totalItems).toFixed(
      2
    );

    console.log(`sector ${currSector} represents ${percentages}%`);

    config.data.labels.push(currSector);
    config.data.datasets[0].data.push(percentages);
  });
  return new Chart(ctx, config);
})();

console.log(config.data.labels);
console.log(config.data.datasets[0].data);

const allData = async () => {
  const data = await loadData();
  tableMaker(data);
};

let sectorValue = "All";

const getSector = async () => {
  const data = await loadData();
  sectorValue = document.getElementById("sectors").value;
  console.log(sectorValue);
  if (sectorValue === "All") {
    return tableMaker(data);
  } else {
    const sectorList = data.filter(element => element.name === sectorValue);
    console.log(sectorList);
    tableMaker(sectorList);
  }
};

let isAscending = true;

const orderToggle = async () => {
  const data = await loadData();
  let targetData = data;
  const sectorList = data.filter(element => element.name === sectorValue);

  if (sectorValue === "All") {
    targetData;
  } else {
    targetData = sectorList;
  }

  if (isAscending) {
    console.log(targetData.sort((a, b) => (a.date > b.date ? 1 : -1)));
    dataSorted = targetData.sort((a, b) => (a.date > b.date ? 1 : -1));
    dateSort.textContent = "Date ▼";
    tableMaker(targetData);
  } else {
    console.log(targetData.sort((a, b) => (a.date < b.date ? 1 : -1)));
    dataSorted = targetData.sort((a, b) => (a.date < b.date ? 1 : -1));
    dateSort.textContent = "Date ▲";
    tableMaker(targetData);
  }
  isAscending = !isAscending;
  console.log(isAscending);
};

allData();
