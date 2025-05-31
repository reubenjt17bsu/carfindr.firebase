/* js/main.js */
async function searchCars() {
  const make = document.getElementById('searchInput').value;
  const res = await fetch(`https://api.api-ninjas.com/v1/cars?make=${make}`, {
    headers: { 'X-Api-Key': 'ofmh3KuRBjGULaduGeBCkQ==hNSvg1PzIO1cSNzN' }
  });
  const cars = await res.json();
  const results = document.getElementById('results');
  results.innerHTML = '';
  cars.forEach(car => {
    const div = document.createElement('div');
    div.className = 'card p-3 mb-2';
    div.innerHTML = `<h5>${car.make} ${car.model}</h5>
                     <p>${car.year} - ${car.fuel_type}</p>
                     <button class='btn btn-sm btn-outline-success'>Save</button>`;
    div.querySelector('button').onclick = () => saveFavorite(car);
    results.appendChild(div);
  });
}

async function saveFavorite(car) {
  const user = auth.currentUser;
  if (!user) return alert('Login first');
  await db.collection('favorites').add({ userId: user.uid, carData: car });
  alert('Saved!');
}

async function loadFavorites() {
  const user = auth.currentUser;
  if (!user) return;
  const snapshot = await db.collection('favorites').where('userId', '==', user.uid).get();
  const list = document.getElementById('favList');
  snapshot.forEach(doc => {
    const car = doc.data().carData;
    const div = document.createElement('div');
    div.className = 'card p-3 mb-2';
    div.innerHTML = `<h5>${car.make} ${car.model}</h5><p>${car.year} - ${car.fuel_type}</p>`;
    list.appendChild(div);
  });
}

auth.onAuthStateChanged(user => {
  if (document.getElementById('favList')) {
    loadFavorites();
  }
});
