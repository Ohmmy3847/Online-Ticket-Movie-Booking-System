let ticketTypeSelections = {};
var listselected_ticket = []
var total_price_booking = 0
var movie_name = ""
async function fetchTicketTypes() {
  try {
    const response = await fetch('/ticket-types');
    if (!response.ok) throw new Error('Network response was not ok');
    const ticketTypes = await response.json();
    return ticketTypes;
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    return [];
  }
}

function formatDateToCustomString(dateInput) {
  const date = new Date(dateInput);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date input");
  }

  // Get date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Format to YYYY-MM-DD HH:MM:SS
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDateTimeToTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
async function fetchShowtime(currentDate, movieId, startSelectedDate, endSelectedDate) {

  // Make a GET request to the server with query parameters
  currentDate = formatDateToCustomString(currentDate)
  startSelectedDate = formatDateToCustomString(startSelectedDate)
  endSelectedDate = formatDateToCustomString(endSelectedDate)
  await fetch(`/get_showtimes?currentDate=${encodeURIComponent(currentDate)}&movieId=${movieId}&start_selectedDate=${encodeURIComponent(startSelectedDate)}&end_selectedDate=${encodeURIComponent(endSelectedDate)}`)
    .then(response => response.json())
    .then(data => {
      console.log("Showtimes data:", data);
      displayShowtimes(data, startSelectedDate);

    })
    .catch(error => console.error("Error fetching showtimes:", error));
}

function displayShowtimes(groupedData, startSelectedDate) {
 
  const time_selected = new Date(startSelectedDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) 
  const summaryContainer = document.getElementById('seatsummary');
  const showtimeContainer = document.getElementById("showtimeContainer");
  const seatContainer = document.getElementById("seatContainer")
  summaryContainer.innerHTML = ''
  seatContainer.innerHTML = ''
  showtimeContainer.innerHTML = ""; // Clear previous showtimes

  if (groupedData.length === 0) {
    showtimeContainer.innerHTML = `
      <p class="text-xl text-white text-center mt-16">ไม่มีรอบฉายในวันที่ ${time_selected}</p>
    `;
    return;
  }

  for (const branchId in groupedData) {
    const branch = groupedData[branchId];
    const branchElement = document.createElement('div');
    branchElement.className = 'branch mb-4';

    // Branch header (always visible)
    branchElement.innerHTML = `
      <div class="flex items-center justify-between p-2  ml-4 md:ml-8 mr-4 md:mr-8 cursor-pointer rounded" onclick="toggleBranch(this)">
        <h2 class="text-xl font-bold text-white">${branch.BranchName}</h2>
        <svg class="w-6 h-6 text-white transform transition-transform" viewBox="0 0 24 24">
          <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
        </svg>
      </div>
      <div class="theater-list hidden pl-4 space-y-4">
      
    `;

    // Theaters (hidden by default)
    for (const theaterId in branch.Theaters) {
      const theater = branch.Theaters[theaterId];
      branchElement.querySelector('.theater-list').innerHTML += `
        <div class="theater">
          <div class="flex items-center space-x-4 mb-1 p-2 pl-4 md:pl-8">
            <h3 class="text-white text-lg">Theater ${theater.TheaterNumber}</h3>
            
          </div>
          <div class="flex flex-wrap gap-2 p-2 ml-4 md:ml-8">
            ${theater.ShowTimes.map(showtime => `
              
              <a href="#seatContainer">
              <button class="px-4 py-2 text-white bg-gray-800 hover:bg-red-600 rounded focus:outline-none " id="${showtime.ShowTimeID}" onclick="getseat(${showtime.ShowTimeID},'${showtime.StartTime}','${branch.BranchName}', '${theater.TheaterNumber}')">
                ${formatDateTimeToTime(showtime.StartTime)}
              </button>
              </a>
            `).join('')}
          </div>
          
        </div>
        
      `;
    }

    branchElement.querySelector('.theater-list').innerHTML += `</div>`;
    showtimeContainer.appendChild(branchElement);
    showtimeContainer.innerHTML += `<hr class="mx-3 md:mx-10 mb-3">`
  }
}
function toggleObjectInArray(arr, obj) {
  // Find the index of the object with the same id in the array
  const index = arr.findIndex(item => item.SeatID === obj.SeatID);
  if (index !== -1) {
    // If the object is found, remove it from the array
    arr.splice(index, 1);
  } else {
    // If the object is not found, push it to the array
    arr.push(obj);
  }
  return arr;
}
function clearSeats() {
  selectedSeats.forEach(seatId => {
    const seatElement = document.getElementById(seatId);
    seatElement.classList.remove('selected');
  });
  selectedSeats = [];
  updateSeatSummary(); // Function to update the summary display
}

function reverseSeats() {
  const allSeats = document.querySelectorAll('.seat');
  selectedSeats = [];

  allSeats.forEach(seat => {
    if (seat.classList.contains('selected')) {
      seat.classList.remove('selected');
    } else {
      seat.classList.add('selected');
      selectedSeats.push(seat.id);
    }
  });

  updateSeatSummary(); // Function to update the summary display
}
let basePricesPerSeat = [];
function getSeatSummary() {
  // Calculate the total price
  const totalPrice = listselected_ticket.reduce((sum, seat) => sum + seat.BasePrice, 0);

  // Get the list of seat names and IDs
  const seatNames = listselected_ticket.map(seat => seat.SeatName);
  const seatID = listselected_ticket.map(seat => seat.SeatID);

  // Store individual base prices
  basePricesPerSeat = listselected_ticket.map(seat => seat.BasePrice);

  return { totalPrice, seatNames, seatID };
}
async function updateSeatSummary() {
  const { totalPrice, seatNames, seatID } = getSeatSummary();
  const movieTitle = document.getElementById("movieTitle").value;
  const day = document.getElementById("datesummary").value;
  const time = document.getElementById("timesummary").value;
  const branch = document.getElementById("branchsummary").value;
  const theater = document.getElementById("theatersummary").value;
  const poster_img_url = document.getElementById("movieposter_url").value;
  const showtimeid = document.getElementById("showtimeid").value;
  const summaryContainer = document.getElementById("seatsummary");

  let CustomerID = 0;
  const customerElement = document.getElementById("Customer_ID");
  if (customerElement) {
    CustomerID = customerElement.value;
  } else {
    console.warn("CustomerID element not found.");
  }
  console.log(CustomerID);

  // Fetch ticket types
  const ticketTypes = await fetchTicketTypes();
  const seatSelectionsHTML = seatNames.map((seat, index) => {
    const previousSelection = ticketTypeSelections[seat] || ticketTypes[0].TicketTypeID;
    
    return `
      <div class="mt-4 relative">
  <label for="ticketType${index}" class="block text-sm md:text-base font-medium text-gray-300 mb-1">${seat}</label>
  <div class="relative">
    <select 
      id="ticketType${index}" 
      name="ticketType${index}"
      class="appearance-none w-full py-2 px-4 bg-[#1a1a1a] border border-[#333333] hover:border-[#e50914] 
             text-white rounded focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] 
             transition-colors duration-200 ease-in-out
             text-sm md:text-base cursor-pointer"
      onchange="updatePrice(${index})"
    >
      ${ticketTypes.map(type => `
        <option 
          value="${type.TicketTypeID}"
          data-multiplier="${type.PriceMultiplier}"
          ${previousSelection === type.TicketTypeID ? 'selected' : ''}
          class="bg-[#1a1a1a]"
        >
          ${type.TypeName}
        </option>
      `).join('')}
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
      </svg>
    </div>
  </div>
</div>
    `;
  }).join('');

  summaryContainer.innerHTML = `
    <div class="bg-black text-white rounded-lg shadow-lg p-4">
      <h1 class="text-xl font-semibold text-white mb-4">SUMMARY</h1>
      <div class="flex flex-row justify-start md:justify-center bg-black text-white rounded-lg shadow-lg overflow-hidden">
        <div class="w-1/2 md:1/3 h-full p-2">
          <img src="${poster_img_url}" alt="${movieTitle}" class="w-full h-auto object-cover rounded-lg">
        </div>
        <div class="w-1/2 p-4 md:items-left">
          <div class="space-y-2">
            <h2 class="text-2xl md:text-xl ">${movieTitle}</h2>
            <p class="text-lg md:text-base ">${branch}</p>
            <p class="text-lg md:text-base">โรงที่ ${theater}</p>
            <p class="text-lg md:text-base text-yellow-400">${day}</p>
            <div class="flex items-center justify-between mt-4">
              <p class="text-lg md:text-base">${time} น.</p>
            </div>
            <h3 id="totalpricedisplay" class="text-lg md:text-base mt-4 md:text-left">ราคา <span class="text-green-600">${totalPrice.toFixed(2)} ฿</span></h3>
          </div>
        </div>
      </div>

      <div class="mt-2 text-center md:text-left">
        <h3 class="text-lg">ที่นั่งที่เลือก</h3>
        <p class="text-sm text-gray-400">${seatNames.length > 0 ? seatNames.join(', ') : 'ยังไม่ได้เลือกที่นั่ง'}</p>
        ${seatSelectionsHTML}
      </div>

      ${seatNames.length > 0 ? 
        `<div class="mt-6 text-center md:text-left">
          <form action="/bookforpay" method="POST">
            <input type="hidden" name="CustomerID" value="${CustomerID}">
            <input type="hidden" name="showtimeID" value="${showtimeid}">
            <input type="hidden" name="SeatID" value='${JSON.stringify(seatID)}'>
            <input type="hidden" name="SeatNames" value='${JSON.stringify(seatNames)}'>
            <input type="hidden" name="amount" value='${totalPrice}' id ="amoutprice">
            <input type="hidden" name="posterImg" value='${poster_img_url}'>
            <input type="hidden" name="movieTitle" value='${movieTitle}'>
            <input type="hidden" name="day" value='${day}'>
            <input type="hidden" name="time" value='${time}'>
            <input type="hidden" name="theater" value='${theater}'>
            <input type="hidden" name="branch" value='${branch}'>
            ${seatNames.map((seat, index) => `<input type="hidden" name="selectedTicketType${index}" value="" id="selectedTicketType${index}">`).join('')}
            <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md">จองตั๋ว</button>
          </form>
        </div>`
      :
        `<div class="mt-6 text-center md:text-left">
          <button disabled class="bg-gray-400 text-white px-4 py-2 rounded-lg shadow-md cursor-not-allowed">จองตั๋ว</button>
        </div>`
      }
    </div>
  `;
  if (seatNames.length > 0) {
    calculateTotalPrice();
  }
}

function updatePrice(index) {
  const ticketSelect = document.getElementById(`ticketType${index}`);
  const selectedOption = ticketSelect.options[ticketSelect.selectedIndex];
  const seatName = listselected_ticket[index].SeatName;
  
  // Store the selection
  ticketTypeSelections[seatName] = ticketSelect.value;
  
  // Store the selected ticket type ID
  const selectedTicketTypeInput = document.getElementById(`selectedTicketType${index}`);
  selectedTicketTypeInput.value = ticketSelect.value;

  calculateTotalPrice();
}
function calculateTotalPrice() {
  let newTotalPrice = 0;
  for (let i = 0; i < basePricesPerSeat.length; i++) {
    const currentSelect = document.getElementById(`ticketType${i}`);
    const currentOption = currentSelect.options[currentSelect.selectedIndex];
    const currentMultiplier = parseFloat(currentOption.getAttribute('data-multiplier'));
    newTotalPrice += basePricesPerSeat[i] * currentMultiplier;
  }

  // Update the total price display
  document.getElementById("totalpricedisplay").innerHTML = `ราคา <span class="text-green-600">${newTotalPrice.toFixed(2)} ฿</span>`;
  document.getElementById("amoutprice").value = newTotalPrice;
}


//get seat and price for booking from selection
function chooseSeat(seatId, seatName, price, element) {
  let insertarr = {
    SeatID: seatId,
    SeatName: seatName,
    BasePrice: price
  }

  // Store ticket type selection before removing seat
  if (listselected_ticket.find(seat => seat.SeatID === seatId)) {
    const index = listselected_ticket.findIndex(seat => seat.SeatID === seatId);
    const ticketTypeSelect = document.getElementById(`ticketType${index}`);
    if (ticketTypeSelect) {
      delete ticketTypeSelections[seatName];
    }
  }

  listselected_ticket = toggleObjectInArray(listselected_ticket, insertarr);

  if (element.classList.contains('bg-red-600')) {
    element.classList.remove('bg-red-600');
    element.classList.add('bg-yellow-600');
  } else {
    element.classList.remove('bg-yellow-600');
    element.classList.add('bg-red-600');
  }

  updateSeatSummary();
}



async function getseat(showtimeId, start_time, BranchName, TheaterNumber) {
  // document.getElementById('loadingIndicator').classList.remove('hidden');
  let date = new Date(start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(',', '')
  let time = formatDateTimeToTime(start_time)
  listselected_ticket = []
  total_price_booking = 0
  ticketTypeSelections = {};

  await fetch(`/get_seat?showTimeID=${showtimeId}`)
    .then(response => response.json())
    .then(data => {

      const seatContainer = document.getElementById("seatContainer")
      seatContainer.innerHTML = ""
      const groupedSeats = {};

      data.seats.forEach(seat => {
        const row = seat.SeatName.match(/^[A-Z]+/)[0]; // Get the row letter (e.g., A, B, VIP)
        if (!groupedSeats[row]) {
          groupedSeats[row] = []; // Initialize array for this row if it doesn't exist
        }
        groupedSeats[row].push(seat); // Add seat to the respective row group
      });
      seatContainer.innerHTML += `
    <input type="text" name="date" id="datesummary" class="hidden" value="${date}">
      <input type="text" name="time" id="timesummary" class="hidden" value="${time}">
    <input type="text" name="branch" id="branchsummary" class="hidden" value="${BranchName}">
      <input type="text" name="theaternum" id="theatersummary" class="hidden" value="${TheaterNumber}">
      <input type="text" name="showtimeid" id="showtimeid" class="hidden" value="${showtimeId}">
    <ul class="showcase flex justify-center  gap-16 w-full ">
        <li class="flex flex-col items-center">
          <div class="seat bg-red-600 w-4 h-4 border-black border"></div>
          <small class="">ว่าง</small>
        </li>
        <li class="flex flex-col items-center">
          <div class="seat selected bg-yellow-600 w-4 h-4 border-black border"></div>
          <small>เลือก</small>
        </li class="flex flex-col items-center">
        <li class="flex flex-col items-center">
          <div class="seat occupied bg-gray-600 w-4 h-4 border-black border"></div>
          <small>จองแล้ว</small>
        </li>
      </ul>
      <div class="flex justify-center  w-full ">
        <div class="screen md:w-3/5 w-4/5"></div>
      </div>`

      for (const row in groupedSeats) {
        let rowHTML = `<div class="row flex flex-row justify-center my-2  ">`;

        groupedSeats[row].forEach((seat, index) => {
          // Determine the class for the seat based on its status
          let seatClass = "";
          let onclick_func = `onclick="chooseSeat(${seat.SeatID},'${seat.SeatName}',${seat.BasePrice}, this)"`
          let cursorpoint = "cursor-pointer"

          if (seat.SeatStatus === "Available") {
            seatClass = "bg-red-600";

          } else if (seat.SeatStatus === "Occupied" || seat.SeatStatus === "Pending") {
            seatClass = "bg-gray-600";
            onclick_func = ""
            cursorpoint = ""
          } else if (seat.SeatStatus === "Selected") {
            seatClass = "bg-yellow-600";
          }




          // Add seat to the current row
          if (row == "VIP") {
            rowHTML += `<div id="seat${seat.SeatID}" class="seat ${seatClass} w-4 h-4 mx-1 sm:mx-2 ${cursorpoint} border-black border" title="${seat.SeatName}" ${onclick_func}></div>`;
          }
          else {
            rowHTML += `<div id="seat${seat.SeatID}" class="seat ${seatClass} w-4 h-4 mx-0 sm:mx-1 ${cursorpoint} border-black border" title="${seat.SeatName}" ${onclick_func}></div>`;
          }

        });

        // Close the row div
        rowHTML += `</div>`;

        // Append the row to the seat container
        seatContainer.innerHTML += `<div class="flex  justify-center "><strong class="mx-1">${row}</strong> ${rowHTML} <strong class="mx-1">${row}</strong> </div>`;

      }
      // document.getElementById('loadingIndicator').classList.add('hidden');
      updateSeatSummary()
    })

    .catch(error => console.error("Error fetching showtimes:", error));
}

// Add this JavaScript function to handle toggling
function toggleBranch(element) {
  const theaterList = element.nextElementSibling;
  const arrow = element.querySelector('svg');

  if (theaterList.classList.contains('hidden')) {
    theaterList.classList.remove('hidden');
    arrow.style.transform = 'rotate(180deg)';
  } else {
    theaterList.classList.add('hidden');
    arrow.style.transform = 'rotate(0)';
  }
}


document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("defaultButton").click();
  const defaultButton = document.getElementById('defaultButton');
  const dateButtons = document.querySelectorAll('.date-button');
  let selectedButton = defaultButton;

  // Highlight the default button on load
  selectedButton.classList.add('bg-red-600');
  selectedButton.classList.remove('bg-gray-800');

  // Add click event to all date buttons
  dateButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Reset previously selected button's color
      if (selectedButton) {
        selectedButton.classList.remove('bg-red-600');
        selectedButton.classList.add('bg-gray-800');
      }

      // Highlight the new selected button
      this.classList.remove('bg-gray-800');
      this.classList.add('bg-red-600');

      // Update selectedButton reference
      selectedButton = this;
    });
  });
});