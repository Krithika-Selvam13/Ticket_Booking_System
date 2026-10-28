// 10+ Curated Movies
const MOVIES = [
  { id: 'm1', title: 'Dune: Part Two', rating: '8.8', genre: 'Sci-Fi, Action', duration: '2h 46m', poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80' },
  { id: 'm2', title: 'Oppenheimer', rating: '8.9', genre: 'Biography, Drama', duration: '3h 00m', poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80' },
  { id: 'm3', title: 'Interstellar: 10th Anniv.', rating: '8.7', genre: 'Sci-Fi, Adventure', duration: '2h 49m', poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&q=80' },
  { id: 'm4', title: 'Spider-Man: Across the Spider-Verse', rating: '8.7', genre: 'Animation, Action', duration: '2h 20m', poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&q=80' },
  { id: 'm5', title: 'Blade Runner 2049', rating: '8.0', genre: 'Sci-Fi, Mystery', duration: '2h 44m', poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80' },
  { id: 'm6', title: 'The Dark Knight', rating: '9.0', genre: 'Action, Crime', duration: '2h 32m', poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80' },
  { id: 'm7', title: 'Inception', rating: '8.8', genre: 'Sci-Fi, Action', duration: '2h 28m', poster: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&q=80' },
  { id: 'm8', title: 'Avatar: The Way of Water', rating: '7.6', genre: 'Sci-Fi, Adventure', duration: '3h 12m', poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
  { id: 'm9', title: 'Gladiator II', rating: '8.4', genre: 'Action, Drama', duration: '2h 30m', poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80' },
  { id: 'm10', title: 'Cyberpunk: Neon City', rating: '8.3', genre: 'Sci-Fi, Thriller', duration: '2h 05m', poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80' },
  { id: 'm11', title: 'Spirited Away', rating: '8.6', genre: 'Animation, Fantasy', duration: '2h 05m', poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80' }
];

const THEATRES = [
  { name: 'PVR: Forum Mall, Koramangala', screen: 'Screen 4 (Dolby Atmos)', slots: ['10:30 AM', '01:45 PM', '05:15 PM', '08:30 PM', '11:15 PM'] },
  { name: 'INOX: Lido Mall, MG Road', screen: 'Screen 2 (IMAX 3D)', slots: ['11:00 AM', '02:30 PM', '06:00 PM', '09:45 PM'] },
  { name: 'Cinépolis: Royal Meenakshi Mall', screen: 'VIP Screen 1', slots: ['12:15 PM', '03:45 PM', '07:30 PM', '10:50 PM'] }
];

const AppState = {
  currentView: 'home',
  currentUser: 'user1',
  selectedMovie: null,
  selectedDate: '28 Oct',
  selectedTheatre: null,
  selectedSlot: null,
  selectedSeats: [],
  activeHoldExpiresAt: null,
  holdTimerInterval: null,
  userBookings: []
};

function switchUser(userId) {
  AppState.currentUser = userId;
  showToast(`Switched active user to ${userId}`, 'brand');
  if (AppState.currentView === 'seatSelection') renderSeatSelection();
}

function showToast(msg, type = 'brand') {
  const t = document.getElementById('toast');
  t.className = `fixed bottom-6 right-6 z-50 transform transition-all duration-300 px-4 py-3 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md ${
    type === 'brand' ? 'bg-charcoal-800 border-brand-500 text-brand-400' : 'bg-red-950/90 border-red-500 text-red-200'
  }`;
  t.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${msg}</span>`;
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(24px)';
  }, 3500);
}

function navigateTo(view) {
  AppState.currentView = view;
  const container = document.getElementById('viewContainer');
  if (view === 'home') renderHome(container);
  else if (view === 'seatSelection') renderSeatSelection(container);
  else if (view === 'myBookings') renderMyBookings(container);
  else if (view === 'organiser') renderOrganiser(container);
}

// 1. Home View with React Bits 3D Circular Carousel
function renderHome(container) {
  container.innerHTML = `
    <div class="text-center mb-8">
      <span class="text-xs uppercase tracking-widest text-brand-400 font-bold bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">Now Showing</span>
      <h1 class="text-4xl font-extrabold text-white mt-3">Choose Your <span class="shiny-text">Experience</span></h1>
      <p class="text-zinc-400 text-sm mt-1">Spin the 3D orbit or drag to explore Bengaluru screenings</p>
    </div>

    <!-- 3D Circular Carousel Mount -->
    <div id="carouselWrapper" class="relative mb-8"></div>

    <!-- Active Spotlight Info Box -->
    <div id="spotlightMovieCard" class="max-w-xl mx-auto spotlight-card p-6 flex gap-5 items-center shadow-2xl"></div>

    <!-- Date Selection Bar -->
    <div class="mt-12">
      <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Select Date</h3>
      <div class="flex gap-2.5 overflow-x-auto pb-2" id="datePicker"></div>
    </div>

    <!-- Showtimes List -->
    <div class="mt-8 space-y-4" id="theatresList"></div>
  `;

  // Mount 3D Orbit Carousel
  new CircularCarousel('carouselWrapper', MOVIES, (movie) => {
    AppState.selectedMovie = movie;
    updateSpotlightBox(movie);
  });

  // Mount Dates
  const dates = [
    { label: 'TODAY', date: '28 OCT' },
    { label: 'THU', date: '29 OCT' },
    { label: 'FRI', date: '30 OCT' },
    { label: 'SAT', date: '31 OCT' },
    { label: 'SUN', date: '01 NOV' }
  ];
  const datePicker = document.getElementById('datePicker');
  dates.forEach(d => {
    const isSelected = AppState.selectedDate === d.date;
    const btn = document.createElement('button');
    btn.className = `px-5 py-2.5 rounded-xl text-center flex flex-col items-center min-w-[90px] border transition ${
      isSelected 
        ? 'bg-brand-500 text-white border-brand-400 shadow-lg shadow-brand-500/30' 
        : 'bg-charcoal-800 text-zinc-400 border-zinc-700/60 hover:border-zinc-500'
    }`;
    btn.innerHTML = `<span class="text-[10px] font-bold tracking-wider">${d.label}</span><span class="text-sm font-extrabold">${d.date}</span>`;
    btn.onclick = () => {
      AppState.selectedDate = d.date;
      renderHome(container);
    };
    datePicker.appendChild(btn);
  });

  renderTheatres();
}

function updateSpotlightBox(movie) {
  const box = document.getElementById('spotlightMovieCard');
  if (!box) return;
  box.innerHTML = `
    <img src="${movie.poster}" class="w-20 h-28 object-cover rounded-lg shadow-md">
    <div class="flex-grow">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300"><i class="fa-solid fa-star"></i> ${movie.rating}</span>
        <span class="text-xs text-zinc-400">${movie.duration}</span>
      </div>
      <h3 class="text-xl font-bold text-white mt-1">${movie.title}</h3>
      <p class="text-xs text-zinc-400">${movie.genre}</p>
    </div>
  `;
}

function renderTheatres() {
  const container = document.getElementById('theatresList');
  if (!container) return;
  container.innerHTML = THEATRES.map(t => `
    <div class="spotlight-card p-5">
      <div class="flex justify-between items-center mb-3">
        <div>
          <h4 class="font-bold text-white text-base"><i class="fa-solid fa-video text-brand-500 mr-2"></i>${t.name}</h4>
          <span class="text-xs text-zinc-400">${t.screen}</span>
        </div>
        <span class="text-[10px] tracking-widest text-emerald-400 font-mono"><i class="fa-solid fa-bolt"></i> M-TICKET READY</span>
      </div>
      <div class="flex flex-wrap gap-2.5">
        ${t.slots.map(s => `
          <button onclick="selectShowtime('${t.name}', '${s}')" class="px-4 py-2 rounded-lg bg-charcoal-700/80 hover:bg-brand-500 hover:text-white border border-zinc-700 text-xs font-semibold text-zinc-200 transition">
            ${s}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function selectShowtime(theatre, slot) {
  AppState.selectedTheatre = theatre;
  AppState.selectedSlot = slot;
  if (!AppState.selectedMovie) AppState.selectedMovie = MOVIES[0];
  navigateTo('seatSelection');
}

// 2. Seat Selection View with Visual 2D Grid & 5-Min Timer
async function renderSeatSelection() {
  const container = document.getElementById('viewContainer');
  const showKey = `${AppState.selectedMovie.title}_${AppState.selectedTheatre}_${AppState.selectedDate}_${AppState.selectedSlot}`;

  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div>
        <button onclick="navigateTo('home')" class="text-xs text-zinc-400 hover:text-brand-400 transition mb-1"><i class="fa-solid fa-arrow-left"></i> Back to Shows</button>
        <h2 class="text-2xl font-bold text-white">${AppState.selectedMovie.title}</h2>
        <p class="text-xs text-zinc-400">${AppState.selectedTheatre} • <span class="text-brand-400 font-medium">${AppState.selectedDate}, ${AppState.selectedSlot}</span></p>
      </div>
      <div id="holdTimerBox" class="hidden px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold flex items-center gap-2">
        <i class="fa-solid fa-stopwatch animate-pulse"></i> Hold expires in: <span id="timerCountdown">05:00</span>
      </div>
    </div>

    <!-- Ambient Curved Cinema Projection Screen -->
    <div class="cinema-screen-glow"></div>

    <!-- Seats Matrix Container -->
    <div class="max-w-3xl mx-auto bg-charcoal-800/60 p-6 rounded-2xl border border-zinc-800/80 mb-20 shadow-2xl">
      <div id="seatGrid" class="flex flex-col gap-2.5 items-center">
        <div class="text-xs text-zinc-500 py-10 animate-pulse"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Querying live inventory...</div>
      </div>

      <!-- Legend -->
      <div class="flex justify-center gap-6 mt-8 pt-6 border-t border-zinc-800 text-xs text-zinc-400">
        <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-charcoal-700 border border-zinc-600"></span> Available</span>
        <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-brand-500"></span> Selected</span>
        <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-amber-500/60 border border-amber-400 animate-pulse"></span> Held by Other</span>
        <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-zinc-800 opacity-40"></span> Sold</span>
      </div>
    </div>

    <!-- Sticky Bottom Checkout Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-charcoal-900/95 border-t border-zinc-800 backdrop-blur-md py-4 z-40">
      <div class="max-w-5xl mx-auto px-4 flex justify-between items-center">
        <div>
          <span class="text-xs text-zinc-400">Selected Seats:</span>
          <div class="text-sm font-bold text-white" id="selectedSeatsLabel">None</div>
        </div>
        <div class="flex items-center gap-6">
          <div class="text-right">
            <span class="text-xs text-zinc-400">Total Price:</span>
            <div class="text-xl font-extrabold text-brand-400" id="totalPriceLabel">₹0</div>
          </div>
          <button id="proceedPayBtn" disabled onclick="initiatePaymentFlow()" class="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white shadow-lg shadow-brand-500/30 transition">
            Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  `;

  // Fetch seats from server
  try {
    const res = await fetch(`/api/shows/${encodeURIComponent(showKey)}/seats`);
    const data = await res.json();
    renderSeatsGrid(data.seats);
  } catch (err) {
    showToast('Failed to connect to backend', 'error');
  }
}

function renderSeatsGrid(seats) {
  const grid = document.getElementById('seatGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  rows.forEach(r => {
    const rowEl = document.createElement('div');
    rowEl.className = 'flex items-center gap-2';

    const label = document.createElement('span');
    label.className = 'w-6 text-xs font-mono font-bold text-zinc-500 text-center';
    label.innerText = r;
    rowEl.appendChild(label);

    for (let c = 1; c <= 10; c++) {
      const sId = `${r}${c}`;
      const seat = seats[sId];
      const isSelected = AppState.selectedSeats.includes(sId);
      const isHeldByMe = seat.status === 'HELD' && seat.heldByUserId === AppState.currentUser;
      const isHeldByOther = seat.status === 'HELD' && seat.heldByUserId !== AppState.currentUser;
      const isBooked = seat.status === 'BOOKED';

      const btn = document.createElement('button');
      btn.className = `w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center ${
        isBooked 
          ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          : isHeldByOther 
            ? 'bg-amber-600/30 border border-amber-500 text-amber-300 animate-pulse cursor-not-allowed'
            : isSelected || isHeldByMe 
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/50 scale-105'
              : 'bg-charcoal-700/80 hover:border-brand-500/60 border border-zinc-700 text-zinc-300'
      }`;
      btn.innerText = c;

      if (!isBooked && !isHeldByOther) {
        btn.onclick = () => toggleSeat(sId, seat.price);
      }
      rowEl.appendChild(btn);
    }
    grid.appendChild(rowEl);
  });
}

function toggleSeat(sId, price) {
  const idx = AppState.selectedSeats.indexOf(sId);
  if (idx > -1) {
    AppState.selectedSeats.splice(idx, 1);
  } else {
    if (AppState.selectedSeats.length >= 6) {
      showToast('Maximum 6 seats allowed per booking.', 'error');
      return;
    }
    AppState.selectedSeats.push(sId);
  }
  updateBottomCheckoutBar();
}

function updateBottomCheckoutBar() {
  const label = document.getElementById('selectedSeatsLabel');
  const priceLabel = document.getElementById('totalPriceLabel');
  const payBtn = document.getElementById('proceedPayBtn');
  if (!label) return;

  if (AppState.selectedSeats.length === 0) {
    label.innerText = 'None';
    priceLabel.innerText = '₹0';
    payBtn.disabled = true;
  } else {
    label.innerText = AppState.selectedSeats.join(', ');
    const total = AppState.selectedSeats.reduce((sum, sId) => {
      const r = sId[0];
      const p = ['A', 'B'].includes(r) ? 350 : ['C', 'D', 'E', 'F'].includes(r) ? 250 : 150;
      return sum + p;
    }, 0);
    priceLabel.innerText = `₹${total}`;
    payBtn.disabled = false;
  }
}

// 3. Initiate Lock & Mock Payment Modal
async function initiatePaymentFlow() {
  const showKey = `${AppState.selectedMovie.title}_${AppState.selectedTheatre}_${AppState.selectedDate}_${AppState.selectedSlot}`;

  showToast('Locking seats in inventory...', 'brand');
  const lockRes = await ConcurrencyEngine.holdSeats(showKey, AppState.selectedSeats, AppState.currentUser);

  if (lockRes.error) {
    showToast(lockRes.error, 'error');
    renderSeatSelection(); // Refresh to show newly taken seats
    return;
  }

  // Mount Payment Simulation Dialog
  const modal = document.createElement('div');
  modal.id = 'paymentModal';
  modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-charcoal-800 border border-zinc-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl">
      <div class="flex justify-between items-center border-b border-zinc-700/60 pb-3 mb-4">
        <h3 class="font-bold text-white text-lg"><i class="fa-solid fa-credit-card text-brand-500 mr-2"></i>Mock Payment Gateway</h3>
        <span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">TEST MODE</span>
      </div>
      <p class="text-xs text-zinc-400 mb-4">Seats <strong>${AppState.selectedSeats.join(', ')}</strong> are held under atomic lock for 5 minutes. Simulate your payment result below:</p>
      
      <div class="space-y-3">
        <button onclick="handlePaymentResult(true)" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-sm shadow-lg shadow-emerald-500/20 transition">
          <i class="fa-solid fa-check-circle mr-2"></i> Simulate Payment Success
        </button>
        <button onclick="handlePaymentResult(false)" class="w-full py-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 font-bold text-rose-300 text-sm transition">
          <i class="fa-solid fa-times-circle mr-2"></i> Simulate Payment Failure
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function handlePaymentResult(success) {
  const modal = document.getElementById('paymentModal');
  if (modal) modal.remove();

  const showKey = `${AppState.selectedMovie.title}_${AppState.selectedTheatre}_${AppState.selectedDate}_${AppState.selectedSlot}`;

  if (success) {
    const totalAmount = AppState.selectedSeats.reduce((sum, sId) => {
      const r = sId[0];
      return sum + (['A', 'B'].includes(r) ? 350 : ['C', 'D', 'E', 'F'].includes(r) ? 250 : 150);
    }, 0);

    const res = await ConcurrencyEngine.confirmBooking(showKey, AppState.selectedSeats, AppState.currentUser, {
      movieTitle: AppState.selectedMovie.title,
      theatre: AppState.selectedTheatre,
      date: AppState.selectedDate,
      time: AppState.selectedSlot,
      totalAmount
    });

    if (res.success) {
      AppState.userBookings.push(res.booking);
      AppState.selectedSeats = [];
      showToast('Booking Confirmed! Pass generated.', 'brand');
      navigateTo('myBookings');
    }
  } else {
    await ConcurrencyEngine.releaseSeats(showKey, AppState.selectedSeats, AppState.currentUser);
    AppState.selectedSeats = [];
    showToast('Payment failed. Seats released back to public inventory.', 'error');
    navigateTo('seatSelection');
  }
}

// 4. "My Bookings" with Ticket Cancellation
function renderMyBookings(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold text-white mb-1">My Bookings</h2>
      <p class="text-xs text-zinc-400 mb-6">Manage confirmed tickets and instant cancellations</p>
      <div id="bookingsList" class="space-y-4"></div>
    </div>
  `;

  const list = document.getElementById('bookingsList');
  if (AppState.userBookings.length === 0) {
    list.innerHTML = `
      <div class="spotlight-card p-12 text-center">
        <i class="fa-solid fa-ticket text-4xl text-zinc-600 mb-3"></i>
        <h4 class="text-lg font-bold text-zinc-300">No active bookings yet</h4>
        <p class="text-xs text-zinc-500 mt-1 mb-4">Book a movie from the home catalogue to see your passes here.</p>
        <button onclick="navigateTo('home')" class="px-5 py-2.5 rounded-xl bg-brand-500 font-bold text-white text-xs">Browse Movies</button>
      </div>
    `;
    return;
  }

  list.innerHTML = AppState.userBookings.map((b, idx) => `
    <div class="spotlight-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-mono font-bold text-brand-400">${b.bookingId}</span>
          <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">CONFIRMED</span>
        </div>
        <h3 class="text-lg font-bold text-white">${b.movieTitle}</h3>
        <p class="text-xs text-zinc-400">${b.theatre} • ${b.date}, ${b.time}</p>
        <p class="text-xs font-bold text-zinc-300 mt-2">Seats: <span class="text-brand-400">${b.seats.join(', ')}</span> (₹${b.totalAmount})</p>
      </div>
      <button onclick="cancelBooking(${idx})" class="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition">
        <i class="fa-solid fa-ban mr-1.5"></i> Cancel Ticket
      </button>
    </div>
  `).join('');
}

async function cancelBooking(index) {
  const b = AppState.userBookings[index];
  if (!confirm(`Cancel ticket ${b.bookingId}? This will immediately release seats ${b.seats.join(', ')}.`)) return;

  await ConcurrencyEngine.releaseSeats(b.showKey, b.seats, b.userId);
  AppState.userBookings.splice(index, 1);
  showToast('Booking cancelled & inventory refunded.', 'brand');
  renderMyBookings(document.getElementById('viewContainer'));
}

// 5. Organiser Dashboard & Race Simulator
async function renderOrganiser(container) {
  container.innerHTML = `
    <div class="flex justify-between items-center mb-8">
      <div>
        <span class="text-xs uppercase font-bold text-brand-400">Management Console</span>
        <h2 class="text-3xl font-extrabold text-white mt-1">Organiser Dashboard</h2>
      </div>
      <button onclick="runRaceConditionTest()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/20">
        <i class="fa-solid fa-bolt mr-2"></i> Run Concurrency Race Simulator
      </button>
    </div>

    <!-- Live Metric Tiles -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8" id="metricsRow">
      <div class="spotlight-card p-5">
        <span class="text-xs text-zinc-400 font-medium">Total Revenue</span>
        <h3 class="text-2xl font-black text-brand-400 mt-2" id="statRevenue">₹0</h3>
      </div>
      <div class="spotlight-card p-5">
        <span class="text-xs text-zinc-400 font-medium">Occupancy Rate</span>
        <h3 class="text-2xl font-black text-emerald-400 mt-2" id="statOccupancy">0%</h3>
      </div>
      <div class="spotlight-card p-5">
        <span class="text-xs text-zinc-400 font-medium">Active Locks</span>
        <h3 class="text-2xl font-black text-amber-400 mt-2" id="statHolds">0</h3>
      </div>
      <div class="spotlight-card p-5">
        <span class="text-xs text-zinc-400 font-medium">Completed Bookings</span>
        <h3 class="text-2xl font-black text-white mt-2" id="statBookings">0</h3>
      </div>
    </div>

    <!-- Simulator Logs Output Box -->
    <div class="spotlight-card p-6">
      <h3 class="text-base font-bold text-white mb-2"><i class="fa-solid fa-terminal text-brand-400 mr-2"></i>Live Concurrency Audit Log</h3>
      <p class="text-xs text-zinc-400 mb-4">Click "Run Concurrency Race Simulator" above to launch 5 simultaneous requests for the exact same seat and observe real-time lock rejection.</p>
      <div id="simLogBox" class="bg-charcoal-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-1.5 min-h-[140px] max-h-60 overflow-y-auto">
        <span class="text-zinc-600">// Engine idle. Ready for evaluation test.</span>
      </div>
    </div>
  `;

  // Fetch live stats from API
  try {
    const res = await fetch('/api/organiser/stats');
    const data = await res.json();
    document.getElementById('statRevenue').innerText = `₹${data.revenue}`;
    document.getElementById('statOccupancy').innerText = `${data.occupancyPct}%`;
    document.getElementById('statHolds').innerText = data.heldSeats;
    document.getElementById('statBookings').innerText = data.totalBookings;
  } catch (err) {}
}

async function runRaceConditionTest() {
  const logBox = document.getElementById('simLogBox');
  logBox.innerHTML = `<span class="text-amber-400 animate-pulse"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Dispatching 5 parallel hold requests for seat B5...</span>`;

  const showKey = `${MOVIES[0].title}_${THEATRES[0].name}_28 OCT_10:30 AM`;
  const logs = await ConcurrencyEngine.simulateRaceCondition(showKey, 'B5');

  logBox.innerHTML = logs.map(l => `<div>${l}</div>`).join('');
  renderOrganiser(document.getElementById('viewContainer'));
}

// Global init on DOM load
window.addEventListener('DOMContentLoaded', () => {
  navigateTo('home');
});