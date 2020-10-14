const movieList = [
    {
        "name": "Avengers: Endgame",
        "price": 10
    },
    {
        "name": "Joker",
        "price": 12
    },
    {
        "name": "Toy Story 4",
        "price": 8
    },
    {
        "name": "The Lion King",
        "price": 9
    }
];

const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(.occupied');
const count = document.getElementById('count');
const total = document.getElementById('total');
const currencyTotal = document.getElementById('currency');
const movieSelect = document.getElementById('movie');
const currencySelect = document.getElementById('curency-select');
const loader = document.getElementById('loading');

let currentCurrency;
let ticketPrice;


// Get current rates from API and save them
async function currentRates() {
    await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
        .then(res => res.json())
        .then(data => {
            currentCurrency = data;
        })
}

function populateUI() {
    // Get available currencies saved from the API and display them
    currencySelect.innerHTML = "";
    for (currency in currentCurrency.rates) {
        const option = document.createElement("option");
        option.value = currency;
        option.innerText = currency;
        currencySelect.appendChild(option);
    }

    // Check for saved currency in localstorage and use it to create prices, otherwise use USD as base.
    const savedCurrency = localStorage.getItem('selectedCurrency');

    if (savedCurrency !== null) {
        for (currency of currencySelect.options) {
            if (currency.value === savedCurrency) {
                currency.selected = true;
            }
        }
    } else {
        for (currency of currencySelect.options) {
            if (currency.value === 'USD') {
                currency.selected = true;
            }
        }
    }

    let currentRate = (currentCurrency.rates[currencySelect.options[currencySelect.selectedIndex].text]).toFixed(2);

    //Populate movie list using the currency selected
    movieSelect.innerHTML = "";
    for (movie of movieList) {
        const option = document.createElement("option");
        option.value = (movie.price*currentRate).toFixed(2);
        option.innerText = `${movie.name} (${(movie.price*currentRate).toFixed(2)} ${currencySelect.options[currencySelect.selectedIndex].text})`;
        movieSelect.appendChild(option);
    }

    const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
    
    if(selectedSeats !== null && selectedSeats.length > 0) {
        seats.forEach((seat, index) => {
            if(selectedSeats.indexOf(index) > -1) {
                seat.classList.add('selected');
            }
        });
    }

    const selectedMovieIndex = localStorage.getItem('selectedMovieIndex');

    if(selectedMovieIndex !== null) {
        movieSelect.selectedIndex = selectedMovieIndex;
    }
}

// Update total and count
function updateSelectedCount() {
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    const seatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));

    localStorage.setItem('selectedSeats', JSON.stringify(seatsIndex));

    const selectedSeatsCount = selectedSeats.length;   

    count.innerText = selectedSeatsCount;
    ticketPrice = +movieSelect.options[movieSelect.selectedIndex].value;
    total.innerText = (selectedSeatsCount * ticketPrice).toFixed(2);
    currencyTotal.innerText = currencySelect.options[currencySelect.selectedIndex].text;
}

// Save selected movie index and price
function setMovieData(movieIndex, moviePrice) {
    localStorage.setItem('selectedMovieIndex', movieIndex);
    localStorage.setItem('selectedMoviePrice', moviePrice);
}

// Save currency data
function setCurrencyData(currency) {
    localStorage.setItem('selectedCurrency', currency);
}

// Movie select event
movieSelect.addEventListener('change', (e) => {
    ticketPrice = +e.target.value;
    setMovieData(e.target.selectedIndex, e.target.value);
    updateSelectedCount();
})

// Seat click event
container.addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
        e.target.classList.toggle('selected');
        updateSelectedCount();
    }
})

//Currency change event
currencySelect.addEventListener('change', (e) => {
    setCurrencyData(e.target.value);
    populateUI();
    updateSelectedCount();
});

// Init function to load all data, with a pseudo loading screen to simulate delays from the API
async function init() {
    await currentRates();
    populateUI();
    updateSelectedCount();
    setTimeout(function() {
        loader.style.display = "none";
    }, 1000);
}

init();
